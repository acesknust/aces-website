try:
    import qrcode
except ImportError:
    qrcode = None
from io import BytesIO
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.conf import settings
import base64

def generate_qr_code(data):
    """
    Generates a QR code for the given data and returns it as a base64 encoded string.
    """
    if qrcode is None:
        return "data:image/png;base64,mocked_qr_code"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"

def send_order_email(order, qr_code_base64):
    """
    Sends an HTML email receipt to the user with the order details and QR code.
    """
    subject = f"ACES Shop Receipt - Order #{order.id}"
    
    # Simple HTML template for the email
    html_content = f"""
    <html>
    <body>
        <h1>Order Confirmation</h1>
        <p>Dear {order.full_name},</p>
        <p>Thank you for your purchase!</p>
        <h3>Order Details:</h3>
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Total Amount:</strong> GHS {order.total_amount}</p>
        <p><strong>Status:</strong> {order.status}</p>
        
        <h3>Verification Code:</h3>
        <img src="{qr_code_base64}" alt="Verification QR Code" style="width: 200px; height: 200px;" />
        <p>Scan this code to verify your purchase.</p>
        
        <p>Best regards,<br>ACES Team</p>
    </body>
    </html>
    """
    
    email = EmailMessage(
        subject,
        html_content,
        settings.EMAIL_HOST_USER,
        [order.email],
    )
    email.content_subtype = "html"
    email.send(fail_silently=True)
