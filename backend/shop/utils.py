import qrcode
from io import BytesIO
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.conf import settings
import base64

import os
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from email.mime.image import MIMEImage

def get_brand_logo(filename='aceslogo.png'):
    """Reads an ACES logo file to attach as CID."""
    try:
        # Look in backend's static/images directory
        logo_path = os.path.join(settings.BASE_DIR, 'static', 'images', filename)
        with open(logo_path, 'rb') as f:
            return f.read()
    except FileNotFoundError:
        print(f"Logo not found at: {logo_path}")
        return None

def _generate_items_html(order, is_admin=False):
    html = ""
    border_color = "#e5e7eb" if not is_admin else "#4b5563"
    text_color = "#111827" if not is_admin else "#e5e7eb"
    subtext_color = "#6b7280" if not is_admin else "#9ca3af"
    
    for item in order.items.all():
        html += f"""
        <tr style="border-bottom: 1px solid {border_color};">
            <td style="padding: 16px 10px; vertical-align: top;">
                <span style="display: block; font-weight: 500; color: {text_color}; font-size: 15px;">{item.product.name}</span>
                <div style="color: {subtext_color}; font-size: 13px; margin-top: 4px;">
                    {f" Color: <span style='font-weight:600'>{item.selected_color}</span>" if item.selected_color else ""}
                    {f" {item.selected_size}" if item.selected_size else ""}
                </div>
            </td>
            <td style="padding: 16px 10px; text-align: center; vertical-align: top; color: {text_color};">{item.quantity}</td>
            <td style="padding: 16px 10px; text-align: right; vertical-align: top; font-weight: 500; color: {text_color}; white-space: nowrap;">GHS {item.price}</td>
        </tr>
        """
    return html

def send_customer_email(order):
    """
    Sends a premium HTML receipt to the customer.
    """
    subject = f"Order Confirmation #{order.id} - ACES Shop"
    items_html = _generate_items_html(order)
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{ margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; }}
        </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; -webkit-font-smoothing: antialiased;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
            <!-- Header with Gradient -->
            <tr>
                <td align="center" style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 30px 20px;">
                    <img src="cid:logo_white" alt="ACES Logo" style="height: 60px; width: auto; display: block;">
                </td>
            </tr>
            
            <!-- Main Content -->
            <tr>
                <td style="padding: 40px 30px;">
                    <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">Payment Successful!</h1>
                    <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; text-align: center;">
                        Hi {order.full_name},<br>
                        Thanks for your purchase. We're getting your order ready to be shipped. 
                    </p>
                    
                    <!-- Order Info Card -->
                    <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;">
                        <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order ID</p>
                        <p style="margin: 5px 0 0 0; color: #111827; font-size: 18px; font-weight: 700; font-family: monospace;">#{order.id}</p>
                        <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Date</p>
                        <p style="margin: 5px 0 0 0; color: #111827; font-size: 14px;">{order.created_at.strftime('%B %d, %Y')}</p>
                    </div>

                    <h3 style="color: #111827; font-size: 18px; font-weight: 600; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px; margin-bottom: 15px;">Order Summary</h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                        {items_html}
                        <!-- Total Row -->
                        <tr>
                            <td colspan="2" style="padding: 20px 10px; text-align: right; font-weight: 600; color: #6b7280; font-size: 14px;">Total Paid</td>
                            <td style="padding: 20px 10px; text-align: right; font-weight: 700; color: #2563eb; font-size: 18px; white-space: nowrap;">GHS {order.total_amount}</td>
                        </tr>
                    </table>

                    <!-- Divider -->
                    <div style="border-top: 1px solid #e5e7eb; margin: 30px 0;"></div>
                    
                    <p style="color: #6b7280; font-size: 14px; line-height: 21px; text-align: center;">
                        We will contact you at <strong>{order.phone}</strong> regarding delivery options in your area.<br>
                        If you have any questions, simply reply to this email.
                    </p>
                </td>
            </tr>
            
            <!-- Footer -->
            <tr>
                <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; {order.created_at.year} ACES KNUST. All rights reserved.</p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    
    email = EmailMultiAlternatives(
        subject=subject,
        body="Thank you for your order.", 
        from_email=settings.EMAIL_HOST_USER,
        to=[order.email]
    )
    email.attach_alternative(html_content, "text/html")
    
    # Attach White Logo
    logo_data = get_brand_logo('logo-white.png')
    # Fallback to normal logo if white not found
    if not logo_data:
        logo_data = get_brand_logo('aceslogo.png')
        
    if logo_data:
        logo = MIMEImage(logo_data)
        logo.add_header('Content-ID', '<logo_white>')
        logo.add_header('Content-Disposition', 'inline', filename='logo.png')
        email.attach(logo)
        
    email.send(fail_silently=False)

def send_admin_email(order, admin_email=None):
    """
    Sends an "Ultimate Premium" notification to the Admin.
    """
    # Use provided email, or fallback to settings.ADMIN_EMAIL
    if not admin_email:
        admin_email = getattr(settings, 'ADMIN_EMAIL', 'acesknust.development@gmail.com')
    subject = f"✨ New Order #{order.id} - GHS {order.total_amount}"
    # Determine the Admin URL dynamically
    try:
        # Use the DigitalOcean App URL if available in CSRF_TRUSTED_ORIGINS, or fallback to CORS allowed
        # First check if we have the specific backend URL known
        base_url = "https://aces-shop-backend-w8ro7.ondigitalocean.app"
    except:
        base_url = "http://127.0.0.1:8000"
        
    admin_url = f"{base_url}/admin/shop/order/?q={order.id}"
    
    # Generate Items Rows with better styling
    items_rows = ""
    for item in order.items.all():
        items_rows += f"""
        <tr>
            <td style="padding: 16px 0; border-bottom: 1px dashed #e5e7eb; vertical-align: top;">
                <div style="font-weight: 600; color: #1f2937; font-size: 14px;">{item.product.name}</div>
                <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">
                    {f"<span style='background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 11px;'>{item.selected_color}</span>" if item.selected_color else ""}
                    {f"<span style='background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-left: 4px;'>{item.selected_size}</span>" if item.selected_size else ""}
                </div>
            </td>
            <td style="padding: 16px 0; border-bottom: 1px dashed #e5e7eb; text-align: center; color: #4b5563; vertical-align: top; font-size: 14px;">x{item.quantity}</td>
            <td style="padding: 16px 0; border-bottom: 1px dashed #e5e7eb; text-align: right; font-weight: 600; color: #111827; vertical-align: top; font-size: 14px;">{item.price}</td>
        </tr>
        """

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }}
            a {{ text-decoration: none; }}
        </style>
    </head>
    <body style="background-color: #f8fafc; padding: 40px 10px;">
        
        <!-- Main Container -->
        <div style="max-width: 640px; margin: 0 auto;">
            
            <!-- Brand Logo (Centered Top) -->
            <div style="text-align: center; margin-bottom: 25px;">
                <img src="cid:aceslogo" alt="ACES" style="height: 50px; width: auto; opacity: 0.9;">
            </div>

            <!-- Floating Card -->
            <div style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025); overflow: hidden; border: 1px solid #f1f5f9;">
                
                <!-- Status Banner -->
                <div style="background: linear-gradient(to right, #1e3a8a, #2563eb); padding: 4px;"></div>
                
                <!-- Header Section -->
                <div style="padding: 30px 30px 20px 30px; border-bottom: 1px solid #f1f5f9;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="background-color: #dbeafe; color: #1e40af; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.5px;">New Order</span>
                            <h1 style="margin: 10px 0 5px 0; font-size: 26px; color: #0f172a; letter-spacing: -0.5px;">Order #{order.id}</h1>
                            <p style="margin: 0; color: #64748b; font-size: 14px;">{order.created_at.strftime('%B %d, %Y at %I:%M %p')}</p>
                        </div>
                        <div style="text-align: right;">
                             <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Revenue</div>
                             <div style="font-size: 24px; font-weight: 700; color: #059669; letter-spacing: -0.5px;">GHS {order.total_amount}</div>
                        </div>
                    </div>
                </div>

                <!-- Action Grid (3 Columns) -->
                <div style="background-color: #f8fafc; padding: 15px 30px; border-bottom: 1px solid #f1f5f9;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="padding-right: 10px;">
                                <a href="mailto:{order.email}" style="display: block; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center; color: #475569; font-size: 13px; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                                    <span style="display: block; font-size: 18px; margin-bottom: 4px;">✉️</span> Email
                                </a>
                            </td>
                            <td style="padding-right: 10px;">
                                <a href="tel:{order.phone}" style="display: block; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center; color: #475569; font-size: 13px; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                                    <span style="display: block; font-size: 18px; margin-bottom: 4px;">📞</span> Call
                                </a>
                            </td>
                            <td>
                                <a href="{admin_url}" style="display: block; background-color: #1e293b; border: 1px solid #0f172a; border-radius: 8px; padding: 10px; text-align: center; color: #ffffff; font-size: 13px; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                                    <span style="display: block; font-size: 18px; margin-bottom: 4px;">⚙️</span> Manage
                                </a>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Content Area -->
                <div style="padding: 30px;">
                    
                    <!-- Customer & Shipping Split -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                        <tr>
                            <td width="50%" valign="top" style="padding-right: 20px;">
                                <h3 style="margin: 0 0 12px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Customer</h3>
                                <div style="font-size: 15px; font-weight: 600; color: #0f172a;">{order.full_name}</div>
                                <div style="font-size: 14px; color: #475569; margin-top: 4px;">{order.email}</div>
                                <div style="font-size: 14px; color: #475569; margin-top: 2px;">{order.phone}</div>
                            </td>
                            <td width="50%" valign="top" style="border-left: 1px solid #f1f5f9; padding-left: 20px;">
                                <h3 style="margin: 0 0 12px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Delivery To</h3>
                                <div style="font-size: 14px; color: #334155; line-height: 1.5; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
                                    {order.address}
                                </div>
                            </td>
                        </tr>
                    </table>

                    <!-- Order Items List -->
                    <div style="margin-bottom: 10px;">
                        <h3 style="margin: 0 0 15px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Order Details</h3>
                        <table width="100%" cellpadding="0" cellspacing="0">
                            {items_rows}
                        </table>
                    </div>

                    <!-- Total Section -->
                    <div style="text-align: right; padding-top: 20px;">
                        <span style="font-size: 14px; color: #64748b; margin-right: 15px;">Total Paid</span>
                        <span style="font-size: 20px; font-weight: 700; color: #0f172a;">GHS {order.total_amount}</span>
                    </div>

                </div>

                <!-- Footer / Meta -->
                <div style="background-color: #f8fafc; padding: 15px 30px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 12px; color: #64748b;">
                        <span style="color: #22c55e;">●</span> Payment Verified
                    </div>
                    <div style="font-size: 11px; font-family: monospace; color: #94a3b8; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">
                        REF: {order.paystack_reference}
                    </div>
                </div>

            </div>
            
            <div style="text-align: center; margin-top: 25px; color: #94a3b8; font-size: 12px;">
                &copy; {order.created_at.year} ACES Shop System
            </div>

        </div>
    </body>
    </html>
    """
    
    
    email = EmailMultiAlternatives(
        subject=subject,
        body=f"New Order #{order.id} from {order.full_name} - GHS {order.total_amount}",
        from_email=settings.EMAIL_HOST_USER,
        to=[admin_email]
    )
    email.attach_alternative(html_content, "text/html")
    
    # Attach Logo (Re-added for this premium version)
    logo_data = get_brand_logo('aceslogo.png')
    if logo_data:
        logo = MIMEImage(logo_data)
        logo.add_header('Content-ID', '<aceslogo>')
        # Main logo doesn't need 'inline' disposition sometimes depending on client, but safer to have it
        logo.add_header('Content-Disposition', 'inline', filename='aceslogo.png')
        email.attach(logo)
        
    email.send(fail_silently=False)
