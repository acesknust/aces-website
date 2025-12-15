import qrcode
from io import BytesIO
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.conf import settings
import base64

def send_order_email(order):
    """
    Sends an HTML email receipt to the user with the order details.
    """
    subject = f"ACES Shop Receipt - Order #{order.id}"
    
    # Simple HTML template for the email
    # Generate Items Table
    items_html = ""
    for item in order.items.all():
        color_display = f"({item.selected_color})" if item.selected_color else ""
        items_html += f"""
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                {item.product.name} 
                <div style="color: #666; font-size: 0.9em;">
                    {f"Color: {item.selected_color}" if item.selected_color else ""}
                    {f" | Size: {item.selected_size}" if item.selected_size else ""}
                </div>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">{item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">GHS {item.price}</td>
        </tr>
        """

    html_content = f"""
    <html>
    <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #2563eb; text-align: center;">Order Confirmation</h1>
            <p>Dear {order.full_name},</p>
            <p>Thank you for your purchase! We have received your order.</p>
            
            <h3 style="background-color: #f8f9fa; padding: 10px; border-radius: 5px;">Order Details</h3>
            <p><strong>Order ID:</strong> #{order.id}</p>
            <p><strong>Date:</strong> {order.created_at.strftime('%Y-%m-%d %H:%M')}</p>
            <p><strong>Status:</strong> {order.status}</p>
            
            <h4 style="margin-bottom: 5px;">Customer Info:</h4>
            <p style="margin: 0;"><strong>Name:</strong> {order.full_name}</p>
            <p style="margin: 0;"><strong>Phone:</strong> {order.phone}</p>
            <p style="margin: 0;"><strong>Location:</strong> {order.address}</p>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr style="background-color: #f8f9fa;">
                        <th style="padding: 10px; text-align: left;">Item</th>
                        <th style="padding: 10px; text-align: center;">Qty</th>
                        <th style="padding: 10px; text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    {items_html}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                        <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 1.2em; color: #2563eb;">GHS {order.total_amount}</td>
                    </tr>
                </tfoot>
            </table>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 0.9em;">
                <p>Association of Computer Engineering Students (ACES)<br>KNUST</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    email = EmailMessage(
        subject,
        html_content,
        settings.EMAIL_HOST_USER,
        [order.email],
        bcc=['semanusebuava@gmail.com'] # Admin verification copy
    )
    email.content_subtype = "html"
    email.send(fail_silently=True)
