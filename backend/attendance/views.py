import re
from io import BytesIO

from django.db.models import Count, Q
from django.http import HttpResponse
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from users.perks import HasPerk
from .export import build_workbook
from .models import AttendanceRecord, AttendanceSession
from .serializers import AttendanceRecordSerializer, AttendanceSessionSerializer

XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'


class AttendanceSessionViewSet(viewsets.ModelViewSet):
    """
    Sessions where attendance is taken.
    Taking attendance needs the `take_attendance` perk; exporting needs `export_attendance`.
    """
    serializer_class = AttendanceSessionSerializer

    def get_permissions(self):
        if self.action == 'export':
            return [HasPerk('export_attendance')()]
        if self.action in ('list', 'retrieve') or (self.action == 'records' and self.request.method == 'GET'):
            return [HasPerk('take_attendance', 'export_attendance')()]
        return [HasPerk('take_attendance')()]

    def get_queryset(self):
        return AttendanceSession.objects.select_related('event', 'created_by').annotate(
            total=Count('records'),
            present=Count('records', filter=Q(records__status=AttendanceRecord.STATUS_PRESENT)),
            late=Count('records', filter=Q(records__status=AttendanceRecord.STATUS_LATE)),
            absent=Count('records', filter=Q(records__status=AttendanceRecord.STATUS_ABSENT)),
        )

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get', 'post'])
    def records(self, request, pk=None):
        session = self.get_object()
        if request.method == 'GET':
            serializer = AttendanceRecordSerializer(session.records.select_related('marked_by'), many=True)
            return Response(serializer.data)

        serializer = AttendanceRecordSerializer(data=request.data, context={'session': session})
        serializer.is_valid(raise_exception=True)
        serializer.save(session=session, marked_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='records/bulk')
    def bulk(self, request, pk=None):
        """
        Mark many people at once from pasted text, one per line:
        "Full name, index number" (index number optional).
        """
        session = self.get_object()
        text = request.data.get('text', '')
        record_status = request.data.get('status', AttendanceRecord.STATUS_PRESENT)
        created, skipped = [], []
        for line in text.splitlines():
            parts = [p.strip() for p in re.split(r'[,\t]', line) if p.strip()]
            if not parts:
                continue
            data = {
                'full_name': parts[0],
                'index_number': parts[1] if len(parts) > 1 else '',
                'status': record_status,
            }
            serializer = AttendanceRecordSerializer(data=data, context={'session': session})
            if serializer.is_valid():
                serializer.save(session=session, marked_by=request.user)
                created.append(serializer.data)
            else:
                skipped.append({'line': line.strip(), 'errors': serializer.errors})
        return Response({'created': created, 'skipped': skipped}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def export(self, request, pk=None):
        session = self.get_object()
        buffer = BytesIO()
        build_workbook(session).save(buffer)
        safe_title = re.sub(r'[^A-Za-z0-9_-]+', '_', session.title).strip('_') or 'attendance'
        response = HttpResponse(buffer.getvalue(), content_type=XLSX)
        response['Content-Disposition'] = f'attachment; filename="{safe_title}_{session.date}.xlsx"'
        return response


class AttendanceRecordViewSet(mixins.UpdateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    """Fix or remove a single attendance mark."""
    permission_classes = [HasPerk('take_attendance')]
    serializer_class = AttendanceRecordSerializer
    queryset = AttendanceRecord.objects.select_related('session', 'marked_by')
    http_method_names = ['patch', 'delete']

    def perform_update(self, serializer):
        serializer.save(marked_by=self.request.user)
