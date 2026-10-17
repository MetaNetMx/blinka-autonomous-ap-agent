from fpdf import FPDF
import os

class InvoicePDF(FPDF):
    def header(self):
        pass

    def footer(self):
        self.set_y(-20)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(140, 140, 140)
        self.cell(0, 10, "Blinka Autonomous AP Agent Verification System - Hackathon 30X", align="C")

def create_aws_invoice(output_path):
    pdf = InvoicePDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=25)
    pdf.add_page()

    # Brand Header Bar
    pdf.set_fill_color(35, 47, 62) # AWS dark navy
    pdf.rect(0, 0, 210, 18, "F")
    pdf.set_xy(15, 4)
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(255, 153, 0) # AWS Orange
    pdf.cell(100, 10, "aws", ln=False)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(220, 220, 220)
    pdf.cell(80, 10, "Amazon Web Services Inc.", align="R", ln=True)

    pdf.ln(12)

    # Document Title & Meta
    pdf.set_font("Helvetica", "B", 20)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(110, 10, "TAX INVOICE", ln=False)

    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(70, 6, "INVOICE NUMBER: INV-2026-AWS-88219", align="R", ln=True)
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(110, 5, "Official Service Statement", ln=False)
    pdf.cell(70, 5, "Issue Date: October 14, 2026", align="R", ln=True)
    pdf.cell(110, 5, "", ln=False)
    pdf.cell(70, 5, "Due Date: October 28, 2026 (Net 14)", align="R", ln=True)

    pdf.ln(8)
    pdf.set_draw_color(226, 232, 240)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())
    pdf.ln(6)

    # Vendor & Client Columns
    y_start = pdf.get_y()
    pdf.set_xy(15, y_start)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(90, 6, "VENDOR / REMIT TO:", ln=True)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(51, 65, 85)
    pdf.cell(90, 5, "Amazon Web Services, Inc.", ln=True)
    pdf.cell(90, 5, "410 Terry Avenue North", ln=True)
    pdf.cell(90, 5, "Seattle, WA 98109-5210, USA", ln=True)
    pdf.cell(90, 5, "EIN: 91-1646860", ln=True)

    pdf.set_xy(110, y_start)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(85, 6, "BILLED TO (CLIENT):", ln=True)
    pdf.set_xy(110, y_start + 6)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(51, 65, 85)
    pdf.cell(85, 5, "ACME Holdings Corp.", ln=True)
    pdf.set_xy(110, y_start + 11)
    pdf.cell(85, 5, "Finance & Engineering Dept.", ln=True)
    pdf.set_xy(110, y_start + 16)
    pdf.cell(85, 5, "Account ID: 4492-0019-3381", ln=True)

    pdf.set_y(y_start + 28)

    # Line Items Table Header
    pdf.set_fill_color(241, 245, 249)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(105, 8, " Description / AWS Region", border=1, fill=True)
    pdf.cell(25, 8, " Qty / Hrs", border=1, fill=True, align="C")
    pdf.cell(25, 8, " Rate", border=1, fill=True, align="R")
    pdf.cell(25, 8, " Amount (USD)", border=1, fill=True, align="R")
    pdf.ln()

    # Line Items
    items = [
        ("Amazon Elastic Compute Cloud (EC2) - us-east-1 Instances", "720 hrs", "$1.972", "$1,420.00"),
        ("Amazon Aurora PostgreSQL Serverless v2 - DB Cluster", "1 cluster", "$680.00", "$680.00"),
        ("Amazon Simple Storage Service (S3) & Data Egress", "14.2 TB", "Tiered", "$350.00"),
    ]

    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(51, 65, 85)
    for desc, qty, rate, amt in items:
        pdf.cell(105, 7, f" {desc}", border="LRB")
        pdf.cell(25, 7, qty, border="LRB", align="C")
        pdf.cell(25, 7, rate, border="LRB", align="R")
        pdf.cell(25, 7, f"{amt} ", border="LRB", align="R")
        pdf.ln()

    # Totals
    pdf.ln(2)
    pdf.set_x(120)
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(45, 6, "Subtotal:", align="R")
    pdf.cell(30, 6, "$2,450.00", align="R", ln=True)

    pdf.set_x(120)
    pdf.cell(45, 6, "Sales Tax (0.0%):", align="R")
    pdf.cell(30, 6, "$0.00", align="R", ln=True)

    pdf.set_x(120)
    pdf.set_fill_color(248, 250, 252)
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(16, 185, 129) # green
    pdf.cell(45, 8, "TOTAL AMOUNT DUE: ", align="R")
    pdf.cell(30, 8, "$2,450.00 USD", align="R", ln=True)

    pdf.ln(6)

    # Remittance / Banking Details (Matches Approved Method Ending in 1099)
    pdf.set_fill_color(240, 253, 244) # Soft emerald green
    pdf.set_draw_color(187, 247, 208)
    pdf.rect(15, pdf.get_y(), 180, 42, "DF")

    y_box = pdf.get_y() + 4
    pdf.set_xy(20, y_box)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(21, 128, 61)
    pdf.cell(170, 6, "AUTHORIZED REMITTANCE INSTRUCTIONS (ACH / WIRE)", ln=True)

    pdf.set_xy(20, y_box + 7)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(22, 101, 52)
    pdf.cell(85, 5, "Bank: Portage Bank (FDIC Member / Blinka Partner)", ln=True)
    pdf.set_xy(20, y_box + 12)
    pdf.cell(85, 5, "ABA Routing Number: 026009593", ln=True)
    pdf.set_xy(20, y_box + 17)
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(85, 5, "Account Number: 123456781099  (Ends in 1099)", ln=True)
    pdf.set_xy(20, y_box + 22)
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(85, 5, "Beneficiary: Amazon Web Services, Inc.", ln=True)

    pdf.set_xy(110, y_box + 7)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(80, 5, "Verification Status: Pre-registered in Blinka", ln=True)
    pdf.set_xy(110, y_box + 12)
    pdf.cell(80, 5, "Policy Rule: Under $10,000 threshold ($2,450)", ln=True)
    pdf.set_xy(110, y_box + 17)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(21, 128, 61)
    pdf.cell(80, 5, "[OK] ACTION: AUTO-APPROVE & DISPATCH", ln=True)

    pdf.output(output_path)
    print(f"Generated AWS invoice: {output_path}")

def create_phishing_stripe_invoice(output_path):
    pdf = InvoicePDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=25)
    pdf.add_page()

    # Brand Header Bar with Red Alert accent
    pdf.set_fill_color(99, 91, 255) # Stripe Blurple
    pdf.rect(0, 0, 210, 18, "F")
    pdf.set_xy(15, 4)
    pdf.set_font("Helvetica", "B", 14)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(100, 10, "stripe", ln=False)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(254, 226, 226)
    pdf.cell(80, 10, "[URGENT] INVOICE - IMMEDIATE SETTLEMENT", align="R", ln=True)

    pdf.ln(12)

    # Document Title & Fraud Banner
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(220, 38, 38) # Red Alert
    pdf.cell(110, 10, "PAYMENT NOTICE: PAST DUE", ln=False)

    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(70, 6, "INVOICE #: URG-STRIPE-99412", align="R", ln=True)
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(110, 5, "Annual Platform Processing & Disputed Charge Surcharge", ln=False)
    pdf.cell(70, 5, "Issue Date: October 16, 2026", align="R", ln=True)
    pdf.cell(110, 5, "", ln=False)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(220, 38, 38)
    pdf.cell(70, 5, "Due Date: IMMEDIATE / NET 0", align="R", ln=True)

    pdf.ln(8)
    pdf.set_draw_color(239, 68, 68)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())
    pdf.ln(6)

    # Vendor & Client
    y_start = pdf.get_y()
    pdf.set_xy(15, y_start)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(90, 6, "ISSUER / CLAIMANT:", ln=True)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(51, 65, 85)
    pdf.cell(90, 5, "Stripe Payments LLC", ln=True)
    pdf.cell(90, 5, "354 Oyster Point Blvd", ln=True)
    pdf.cell(90, 5, "South San Francisco, CA 94080", ln=True)

    pdf.set_xy(110, y_start)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(85, 6, "BILLED TO:", ln=True)
    pdf.set_xy(110, y_start + 6)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(51, 65, 85)
    pdf.cell(85, 5, "ACME Holdings Corp.", ln=True)
    pdf.set_xy(110, y_start + 11)
    pdf.cell(85, 5, "Attn: Accounts Payable / Chief Financial Officer", ln=True)

    pdf.set_y(y_start + 26)

    # Line Items Table
    pdf.set_fill_color(254, 242, 242)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(153, 27, 27)
    pdf.cell(115, 8, " Description", border=1, fill=True)
    pdf.cell(20, 8, " Period", border=1, fill=True, align="C")
    pdf.cell(45, 8, " Total Amount (USD)", border=1, fill=True, align="R")
    pdf.ln()

    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(51, 65, 85)
    pdf.cell(115, 7, " Enterprise Payment Infrastructure & Disputed Volume Surcharge", border="LRB")
    pdf.cell(20, 7, "Q3-2026", border="LRB", align="C")
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(45, 7, "$14,250.00 ", border="LRB", align="R")
    pdf.ln()

    # Totals
    pdf.ln(3)
    pdf.set_x(115)
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(220, 38, 38)
    pdf.cell(40, 8, "TOTAL DUE: ", align="R")
    pdf.cell(35, 8, "$14,250.00 USD", align="R", ln=True)

    pdf.ln(6)

    # Fraudulent Wire Instructions (Bank Mismatch Alert Box)
    pdf.set_fill_color(254, 242, 242)
    pdf.set_draw_color(239, 68, 68)
    pdf.rect(15, pdf.get_y(), 180, 50, "DF")

    y_box = pdf.get_y() + 4
    pdf.set_xy(20, y_box)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(185, 28, 28)
    pdf.cell(170, 6, "!! SUSPICIOUS / FRAUDULENT BANK INSTRUCTIONS !!", ln=True)

    pdf.set_xy(20, y_box + 7)
    pdf.set_font("Helvetica", "I", 8.5)
    pdf.set_text_color(153, 27, 27)
    pdf.cell(170, 5, "Notice in email: 'Kindly update remittance account to our subsidiary clearing account'", ln=True)

    pdf.set_xy(20, y_box + 14)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(85, 5, "Bank: Offshore Settlement Bank", ln=True)
    pdf.set_xy(20, y_box + 19)
    pdf.cell(85, 5, "Routing: 026009593", ln=True)
    pdf.set_xy(20, y_box + 24)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(220, 38, 38)
    pdf.cell(85, 5, "Account Number: 987654329999 (Ends in 9999)", ln=True)
    pdf.set_xy(20, y_box + 29)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(85, 5, "Beneficiary: Stripe Global Settlement LLC", ln=True)

    pdf.set_xy(110, y_box + 14)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(185, 28, 28)
    pdf.cell(80, 5, "Blinka Security Engine Analysis:", ln=True)
    pdf.set_xy(110, y_box + 19)
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(153, 27, 27)
    pdf.cell(80, 5, "1. Expected Verified Account: ...1029", ln=True)
    pdf.set_xy(110, y_box + 24)
    pdf.cell(80, 5, "2. Invoice Account: ...9999 (MISMATCH!)", ln=True)
    pdf.set_xy(110, y_box + 29)
    pdf.cell(80, 5, "3. Exceeds limit ($14,250 > $10,000 threshold)", ln=True)
    pdf.set_xy(110, y_box + 35)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(220, 38, 38)
    pdf.cell(80, 5, "[X] BLOCKED: FRAUD_BANK_MISMATCH", ln=True)

    pdf.output(output_path)
    print(f"Generated Phishing Stripe invoice: {output_path}")

if __name__ == "__main__":
    base_dir = r"C:\30x\Hackaton octubre 2026"
    create_aws_invoice(os.path.join(base_dir, "factura_aws_legitima.pdf"))
    create_phishing_stripe_invoice(os.path.join(base_dir, "factura_stripe_phishing_alerta.pdf"))
