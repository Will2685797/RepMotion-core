import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM = os.getenv("SMTP_FROM")


def send_reset_email(to_email: str, token: str):

    reset_link = f"http://localhost:8081/reset-password?token={token}"

    subject = "RepMotion - Reset Password"

    body = f"""
Bonjour,

Vous avez demandé une réinitialisation de mot de passe.

Cliquez sur ce lien :

{reset_link}

Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.

RepMotion
"""

    msg = MIMEMultipart()
    msg["From"] = SMTP_FROM
    msg["To"] = to_email
    msg["Subject"] = subject

    msg.attach(MIMEText(body, "plain"))

    server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
    server.starttls()
    server.login(SMTP_USER, SMTP_PASSWORD)
    server.send_message(msg)
    server.quit()