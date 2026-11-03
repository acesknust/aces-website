from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill
from openpyxl.utils import get_column_letter

from .models import AttendanceRecord

HEADERS = ['#', 'Full name', 'Index number', 'Email', 'Status', 'Note', 'Marked by', 'Marked at']
WIDTHS = [5, 30, 16, 30, 10, 30, 16, 18]


def build_workbook(session):
    """Build an .xlsx workbook with one row per attendance record, plus totals."""
    wb = Workbook()
    ws = wb.active
    ws.title = 'Attendance'

    ws.append([session.title])
    ws['A1'].font = Font(bold=True, size=14)
    details = f"Date: {session.date:%d %B %Y}"
    if session.event:
        details += f"    Event: {session.event.name}"
    ws.append([details])
    ws.append([])

    ws.append(HEADERS)
    header_row = ws.max_row
    for cell in ws[header_row]:
        cell.font = Font(bold=True, color='FFFFFF')
        cell.fill = PatternFill('solid', fgColor='1E3A8A')
    # A string reference avoids creating an empty cell (which would push data down a row)
    ws.freeze_panes = f"A{header_row + 1}"

    records = list(session.records.select_related('marked_by'))
    for i, r in enumerate(records, start=1):
        ws.append([
            i,
            r.full_name,
            r.index_number,
            r.email,
            r.get_status_display(),
            r.note,
            r.marked_by.username if r.marked_by else '',
            r.marked_at.replace(tzinfo=None) if r.marked_at else None,
        ])
        ws.cell(row=ws.max_row, column=8).number_format = 'yyyy-mm-dd hh:mm'

    ws.append([])
    ws.append(['', 'Total', len(records)])
    ws.cell(row=ws.max_row, column=2).font = Font(bold=True)
    for code, label in AttendanceRecord.STATUS_CHOICES:
        ws.append(['', label, sum(1 for r in records if r.status == code)])

    for col, width in enumerate(WIDTHS, start=1):
        ws.column_dimensions[get_column_letter(col)].width = width
    return wb
