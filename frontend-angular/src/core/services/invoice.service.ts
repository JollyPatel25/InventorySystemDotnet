import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { SaleResponseDto } from '../models/sales.models';
import { ProductResponseDto } from '../models/product.models';
import { OrganizationResponseDto } from '../models/organization.models';

export interface InvoiceData {
  sale: SaleResponseDto & { warehouseName?: string };
  products: ProductResponseDto[];
  org: OrganizationResponseDto;
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {

  open(data: InvoiceData): void {
    const blob = this._build(data).output('blob');
    window.open(URL.createObjectURL(blob), '_blank');
  }

  download(data: InvoiceData): void {
    this._build(data).save(`Invoice-${data.sale.invoiceNumber}.pdf`);
  }

  private _build(data: InvoiceData): jsPDF {
    const { sale, products, org } = data;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const PW = 210;
    const M  = 16;
    const CW = PW - M * 2;

    const C = {
      brand:  [25,  118, 210] as [number,number,number],
      dark:   [22,  27,  46]  as [number,number,number],
      mid:    [95,  100, 120] as [number,number,number],
      light:  [245, 247, 251] as [number,number,number],
      border: [218, 224, 235] as [number,number,number],
      white:  [255, 255, 255] as [number,number,number],
      accent: [180, 210, 245] as [number,number,number],
    };

    const fill  = (c: [number,number,number]) => doc.setFillColor(...c);
    const draw  = (c: [number,number,number]) => doc.setDrawColor(...c);
    const color = (c: [number,number,number]) => doc.setTextColor(...c);
    const font  = (style: 'normal'|'bold', size: number) => {
      doc.setFont('helvetica', style);
      doc.setFontSize(size);
    };
    const fmt = (n: number) =>
      'Rs.' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    let y = 0;

    // ── 1. HEADER BAND ────────────────────────────────────────────────────
    const headerH = org.address ? 52 : 44;
    fill(C.brand);
    doc.rect(0, 0, PW, headerH, 'F');

    // Org name
    font('bold', 22);
    color(C.white);
    doc.text(org.name, M, 15);

    // Contact line
    font('normal', 8);
    color(C.accent);
    doc.text(`${org.contactEmail}   |   ${org.contactPhone}`, M, 22);

    // Address line (if available)
    if (org.address) {
      font('normal', 7.5);
      color(C.accent);
      const addrLine = [
        org.address.line1,
        org.address.line2,
        org.address.city,
        org.address.state,
        org.address.country,
        org.address.postalCode
      ].filter(Boolean).join(', ');
      doc.text(addrLine, M, 29);
    }

    // INVOICE label
    font('bold', 26);
    color(C.white);
    doc.text('INVOICE', PW - M, 16, { align: 'right' });

    font('normal', 9);
    color(C.accent);
    doc.text(`# ${sale.invoiceNumber}`, PW - M, 25, { align: 'right' });

    y = headerH + 10;

    // ── 2. META GRID ──────────────────────────────────────────────────────
    fill(C.light);
    draw(C.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, y, CW, 24, 2, 2, 'FD');

    const third = CW / 3;
    const metaItems: [string, string][] = [
      ['Date',      new Date(sale.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
      ['Warehouse', sale.warehouseName ?? '—'],
      ['Payment',   (sale as any).paymentMethod ?? '—'],
    ];

    metaItems.forEach(([label, val], i) => {
      const cx = M + i * third + 6;
      font('normal', 7);
      color(C.mid);
      doc.text(label.toUpperCase(), cx, y + 9);
      font('bold', 10);
      color(C.dark);
      doc.text(val, cx, y + 18);
    });

    y += 32;

    // ── 3. ITEMS TABLE ────────────────────────────────────────────────────
    font('bold', 8);
    color(C.brand);
    doc.text('ITEMS', M, y);
    y += 4;

    fill(C.dark);
    doc.rect(M, y, CW, 8.5, 'F');
    font('bold', 7.5);
    color(C.white);
    const COL = { product: M + 3, qty: M + 106, price: M + 130, sub: M + 158 };
    doc.text('PRODUCT',    COL.product, y + 5.6);
    doc.text('QTY',        COL.qty,     y + 5.6);
    doc.text('UNIT PRICE', COL.price,   y + 5.6);
    doc.text('SUBTOTAL',   COL.sub,     y + 5.6);
    y += 8.5;

    (sale.items ?? []).forEach((item, idx) => {
      const ROW = 8.5;
      fill(idx % 2 === 0 ? C.white : C.light);
      draw(C.border);
      doc.setLineWidth(0.1);
      doc.rect(M, y, CW, ROW, 'FD');

      const rawName  = products.find(p => p.id === item.productId)?.name
                    ?? (item as any).productName ?? item.productId;
      const name     = rawName.length > 46 ? rawName.slice(0, 45) + '…' : rawName;
      const unitPrice = (item as any).unitPrice ?? 0;
      const subtotal  = unitPrice * item.quantity;

      font('normal', 8.5);
      color(C.dark);  doc.text(name,                 COL.product, y + 5.6);
      color(C.mid);   doc.text(String(item.quantity), COL.qty,     y + 5.6);
      color(C.dark);  doc.text(fmt(unitPrice),        COL.price,   y + 5.6);
                      doc.text(fmt(subtotal),          COL.sub,     y + 5.6);
      y += ROW;
    });

    draw(C.border);
    doc.setLineWidth(0.4);
    doc.line(M, y, M + CW, y);
    y += 10;

    // ── 4. SUMMARY ────────────────────────────────────────────────────────
    font('bold', 8);
    color(C.brand);
    doc.text('SUMMARY', M, y);

    const TX = M + CW * 0.52;
    const TW = CW * 0.48;
    const subtotalAmt = sale.totalAmount - sale.taxAmount + sale.discountAmount;

    const summaryRows: [string, string][] = [
      ['Subtotal', fmt(subtotalAmt)],
      ['Tax',      '+ ' + fmt(sale.taxAmount)],
      ['Discount', '− ' + fmt(sale.discountAmount)],
    ];

    summaryRows.forEach(([label, val]) => {
      font('normal', 9);
      color(C.mid);  doc.text(label, TX, y);
      color(C.dark); doc.text(val, TX + TW, y, { align: 'right' });
      y += 7;
    });

    draw(C.border);
    doc.setLineWidth(0.4);
    doc.line(TX, y, TX + TW, y);
    y += 4;

    fill(C.brand);
    doc.rect(TX - 2, y - 1, TW + 2, 12, 'F');
    font('bold', 10);
    color(C.white);
    doc.text('GRAND TOTAL', TX + 1, y + 7);
    doc.text(fmt(sale.totalAmount), TX + TW, y + 7, { align: 'right' });

    y += 20;

    // ── 5. TERMS BOX ──────────────────────────────────────────────────────
    fill(C.light);
    draw(C.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, y, CW, 20, 2, 2, 'FD');

    font('bold', 8.5);
    color(C.dark);
    doc.text('Terms & Notes', M + 4, y + 7);

    font('normal', 7.5);
    color(C.mid);
    doc.text('This is a system-generated invoice and does not require a physical signature.', M + 4, y + 13);
    doc.text(`For queries: ${org.contactEmail}   |   ${org.contactPhone}`, M + 4, y + 19);

    // ── 6. FOOTER BAND ────────────────────────────────────────────────────
    fill(C.dark);
    doc.rect(0, 284, PW, 13, 'F');
    font('normal', 7.5);
    color([140, 155, 185] as [number,number,number]);
    const footerParts = [org.name, org.contactEmail, org.contactPhone];
    if (org.address?.city) footerParts.push(`${org.address.city}, ${org.address.country}`);
    doc.text(footerParts.join('   |   '), PW / 2, 292, { align: 'center' });

    return doc;
  }
}