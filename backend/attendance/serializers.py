from rest_framework import serializers
from .models import AttendanceRecord, AttendanceSession


class AttendanceRecordSerializer(serializers.ModelSerializer):
    marked_by = serializers.CharField(source='marked_by.username', read_only=True, default=None)

    class Meta:
        model = AttendanceRecord
        fields = ('id', 'session', 'full_name', 'index_number', 'email', 'status', 'note', 'marked_by', 'marked_at')
        read_only_fields = ('session', 'marked_by', 'marked_at')

    def validate_index_number(self, value):
        value = value.strip()
        session = self.context.get('session') or getattr(self.instance, 'session', None)
        if value and session:
            clash = session.records.filter(index_number__iexact=value)
            if self.instance:
                clash = clash.exclude(pk=self.instance.pk)
            if clash.exists():
                raise serializers.ValidationError("This index number is already marked for this session.")
        return value


class AttendanceSessionSerializer(serializers.ModelSerializer):
    event_name = serializers.CharField(source='event.name', read_only=True, default=None)
    created_by = serializers.CharField(source='created_by.username', read_only=True, default=None)
    total = serializers.IntegerField(read_only=True)
    present = serializers.IntegerField(read_only=True)
    late = serializers.IntegerField(read_only=True)
    absent = serializers.IntegerField(read_only=True)

    class Meta:
        model = AttendanceSession
        fields = (
            'id', 'title', 'date', 'event', 'event_name', 'notes', 'created_by', 'created_at',
            'total', 'present', 'late', 'absent',
        )
        read_only_fields = ('created_by', 'created_at')
