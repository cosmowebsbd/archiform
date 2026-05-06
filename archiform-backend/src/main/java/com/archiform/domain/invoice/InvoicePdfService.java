package com.archiform.domain.invoice;

import com.archiform.exception.ResourceNotFoundException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class InvoicePdfService {

    private final InvoiceRepository invoiceRepository;

    public InvoicePdfService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    private static final float MARGIN = 50f;
    private static final float PAGE_WIDTH = PDRectangle.A4.getWidth();
    private static final float PAGE_HEIGHT = PDRectangle.A4.getHeight();
    private static final Color NAVY = new Color(15, 23, 42);
    private static final Color BRAND = new Color(108, 92, 231);
    private static final Color GRAY = new Color(107, 114, 128);
    private static final Color LIGHT_GRAY = new Color(243, 244, 246);
    private static final Color WHITE = Color.WHITE;

    private PDType1Font BOLD;
    private PDType1Font REGULAR;
    private PDType1Font ITALIC;

    @Transactional(readOnly = true)
    public byte[] generateInvoicePdf(UUID invoiceId, UUID firmId) throws IOException {
        Invoice invoice = invoiceRepository.findByIdAndFirmId(invoiceId, firmId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", invoiceId));

        BOLD    = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
        REGULAR = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        ITALIC  = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);

        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                float y = PAGE_HEIGHT - MARGIN;

                // ── Header background
                drawRect(cs, 0, PAGE_HEIGHT - 120, PAGE_WIDTH, 120, NAVY);

                // ── Firm name / logo area
                drawText(cs, BOLD, 22, invoice.getFirm().getName(),
                        MARGIN, PAGE_HEIGHT - 50, WHITE);
                drawText(cs, REGULAR, 10, "INVOICE",
                        MARGIN, PAGE_HEIGHT - 70, new Color(148, 163, 184));

                // ── Invoice number top right
                String invNum = invoice.getInvoiceNumber();
                float invNumWidth = BOLD.getStringWidth(invNum) / 1000 * 14;
                drawText(cs, BOLD, 14, invNum,
                        PAGE_WIDTH - MARGIN - invNumWidth,
                        PAGE_HEIGHT - 50, WHITE);
                drawText(cs, REGULAR, 9, "Invoice Number",
                        PAGE_WIDTH - MARGIN - invNumWidth,
                        PAGE_HEIGHT - 65, new Color(148, 163, 184));

                y = PAGE_HEIGHT - 140;

                // ── Bill To + Invoice Details row
                // Left: Bill To
                drawText(cs, BOLD, 9, "BILL TO", MARGIN, y, GRAY);
                y -= 16;
                if (invoice.getContact() != null) {
                    var contact = invoice.getContact();
                    drawText(cs, BOLD, 11, contact.getName(), MARGIN, y, NAVY);
                    y -= 14;
                    if (contact.getCompany() != null) {
                        drawText(cs, REGULAR, 10, contact.getCompany(), MARGIN, y, GRAY);
                        y -= 13;
                    }
                    if (contact.getEmail() != null) {
                        drawText(cs, REGULAR, 10, contact.getEmail(), MARGIN, y, GRAY);
                        y -= 13;
                    }
                    if (contact.getPhone() != null) {
                        drawText(cs, REGULAR, 10, contact.getPhone(), MARGIN, y, GRAY);
                        y -= 13;
                    }
                } else {
                    drawText(cs, REGULAR, 10, "No client assigned", MARGIN, y, GRAY);
                    y -= 14;
                }

                // Right: Invoice details
                float rightCol = PAGE_WIDTH / 2 + 20;
                float detailY = PAGE_HEIGHT - 140;

                drawText(cs, BOLD, 9, "INVOICE DETAILS",
                        rightCol, detailY, GRAY);
                detailY -= 16;

                String[][] details = {
                    { "Issue Date", formatDate(invoice.getIssueDate()) },
                    { "Due Date",   formatDate(invoice.getDueDate()) },
                    { "Project",    invoice.getProject() != null
                                    ? invoice.getProject().getName() : "—" },
                    { "Status",     invoice.getStatus().name() },
                };

                for (String[] detail : details) {
                    drawText(cs, REGULAR, 9, detail[0], rightCol, detailY, GRAY);
                    float valWidth = BOLD.getStringWidth(detail[1]) / 1000 * 10;
                    drawText(cs, BOLD, 10, detail[1],
                            PAGE_WIDTH - MARGIN - valWidth, detailY, NAVY);
                    detailY -= 15;
                }

                y = Math.min(y, detailY) - 20;

                // ── Divider
                drawLine(cs, MARGIN, y, PAGE_WIDTH - MARGIN, y, LIGHT_GRAY, 1f);
                y -= 20;

                // ── Line items table header
                drawRect(cs, MARGIN, y - 8, PAGE_WIDTH - MARGIN * 2, 24, NAVY);

                float[] colX = {
                    MARGIN + 8,
                    PAGE_WIDTH - MARGIN - 200,
                    PAGE_WIDTH - MARGIN - 120,
                    PAGE_WIDTH - MARGIN - 60,
                    PAGE_WIDTH - MARGIN - 8,
                };

                drawText(cs, BOLD, 9, "DESCRIPTION", colX[0], y + 8, WHITE);
                drawText(cs, BOLD, 9, "QTY",         colX[1], y + 8, WHITE);
                drawText(cs, BOLD, 9, "UNIT PRICE",  colX[2], y + 8, WHITE);
                drawText(cs, BOLD, 9, "AMOUNT",      colX[3], y + 8, WHITE);

                y -= 24;

                // ── Line items
                List<InvoiceLineItem> lineItems = invoice.getLineItems();
                boolean alternate = false;

                for (InvoiceLineItem item : lineItems) {
                    if (alternate) {
                        drawRect(cs, MARGIN, y - 6,
                                PAGE_WIDTH - MARGIN * 2, 22, LIGHT_GRAY);
                    }

                    drawText(cs, REGULAR, 10, truncate(item.getDescription(), 45),
                            colX[0], y + 6, NAVY);
                    drawTextRight(cs, REGULAR, 10,
                            String.valueOf(item.getQuantity().intValue()),
                            colX[1] + 30, y + 6, NAVY);
                    drawTextRight(cs, REGULAR, 10,
                            formatCurrency(item.getUnitPrice()),
                            colX[2] + 60, y + 6, NAVY);
                    drawTextRight(cs, BOLD, 10,
                            formatCurrency(item.getAmount()),
                            PAGE_WIDTH - MARGIN, y + 6, NAVY);

                    y -= 22;
                    alternate = !alternate;

                    if (y < 150) {
                        // Add new page if needed
                        cs.close();
                        break;
                    }
                }

                y -= 10;

                // ── Divider
                drawLine(cs, MARGIN, y, PAGE_WIDTH - MARGIN, y, LIGHT_GRAY, 1f);
                y -= 20;

                // ── Totals
                float totalsX = PAGE_WIDTH - MARGIN - 200;

                drawTotalRow(cs, "Subtotal",
                        formatCurrency(invoice.getSubtotal()),
                        totalsX, y, NAVY, false);
                y -= 18;

                if (invoice.getTaxRate() != null &&
                    invoice.getTaxRate().compareTo(BigDecimal.ZERO) > 0) {
                    String taxLabel = String.format("Tax (%.0f%%)",
                            invoice.getTaxRate().multiply(BigDecimal.valueOf(100)));
                    drawTotalRow(cs, taxLabel,
                            formatCurrency(invoice.getTaxAmount()),
                            totalsX, y, GRAY, false);
                    y -= 18;
                }

                // ── Total box
                drawRect(cs, totalsX - 10, y - 8,
                        PAGE_WIDTH - MARGIN - totalsX + 10, 26, BRAND);
                drawText(cs, BOLD, 12, "TOTAL", totalsX, y + 8, WHITE);
                String totalStr = formatCurrency(invoice.getTotal());
                float totalWidth = BOLD.getStringWidth(totalStr) / 1000 * 12;
                drawText(cs, BOLD, 12, totalStr,
                        PAGE_WIDTH - MARGIN - totalWidth, y + 8, WHITE);
                y -= 30;

                // ── Notes
                if (invoice.getNotes() != null && !invoice.getNotes().isBlank()) {
                    y -= 20;
                    drawText(cs, BOLD, 9, "NOTES", MARGIN, y, GRAY);
                    y -= 15;
                    drawText(cs, REGULAR, 10, invoice.getNotes(), MARGIN, y, NAVY);
                    y -= 15;
                }

                // ── Footer
                drawLine(cs, MARGIN, 60, PAGE_WIDTH - MARGIN, 60, LIGHT_GRAY, 0.5f);
                drawText(cs, REGULAR, 8,
                        invoice.getFirm().getName() + " · " +
                        invoice.getInvoiceNumber(),
                        MARGIN, 45, GRAY);
                drawText(cs, REGULAR, 8,
                        "Generated by Archiform",
                        PAGE_WIDTH - MARGIN - 90, 45, GRAY);
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            return baos.toByteArray();
        }
    }

    // ── Helpers ──────────────────────────────────────────

    private void drawText(PDPageContentStream cs, PDType1Font font,
                           float size, String text,
                           float x, float y, Color color) throws IOException {
        cs.beginText();
        cs.setFont(font, size);
        cs.setNonStrokingColor(color);
        cs.newLineAtOffset(x, y);
        cs.showText(sanitize(text));
        cs.endText();
    }

    private void drawTextRight(PDPageContentStream cs, PDType1Font font,
                                float size, String text,
                                float rightEdge, float y,
                                Color color) throws IOException {
        float width = font.getStringWidth(sanitize(text)) / 1000 * size;
        drawText(cs, font, size, text, rightEdge - width, y, color);
    }

    private void drawRect(PDPageContentStream cs,
                           float x, float y, float w, float h,
                           Color color) throws IOException {
        cs.setNonStrokingColor(color);
        cs.addRect(x, y, w, h);
        cs.fill();
    }

    private void drawLine(PDPageContentStream cs,
                           float x1, float y1, float x2, float y2,
                           Color color, float width) throws IOException {
        cs.setStrokingColor(color);
        cs.setLineWidth(width);
        cs.moveTo(x1, y1);
        cs.lineTo(x2, y2);
        cs.stroke();
    }

    private void drawTotalRow(PDPageContentStream cs,
                               String label, String value,
                               float x, float y,
                               Color color, boolean bold) throws IOException {
        drawText(cs, REGULAR, 10, label, x, y, GRAY);
        float valWidth = BOLD.getStringWidth(value) / 1000 * 10;
        drawText(cs, bold ? BOLD : REGULAR, 10, value,
                PAGE_WIDTH - MARGIN - valWidth, y, color);
    }

    private String formatDate(Object date) {
        if (date == null) return "—";
        if (date instanceof LocalDate ld) {
            return ld.format(DateTimeFormatter.ofPattern("MMM d, yyyy"));
        }
        return date.toString();
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "$0.00";
        return NumberFormat.getCurrencyInstance(Locale.US).format(amount);
    }

    private String truncate(String text, int maxLen) {
        if (text == null) return "";
        return text.length() > maxLen ? text.substring(0, maxLen) + "..." : text;
    }

    private String sanitize(String text) {
        if (text == null) return "";
        return text.replaceAll("[^\\x20-\\x7E]", "?");
    }
}