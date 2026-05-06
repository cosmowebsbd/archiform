package com.archiform.graphql;

import com.archiform.domain.invoice.InvoicePdfService;
import com.archiform.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
public class InvoicePdfController {

    private final InvoicePdfService pdfService;
    private final JwtTokenProvider jwtTokenProvider;

    public InvoicePdfController(InvoicePdfService pdfService,
                                 JwtTokenProvider jwtTokenProvider) {
        this.pdfService = pdfService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(
            @PathVariable String id,
            HttpServletRequest request) {

        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).build();
            }

            String token = authHeader.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(401).build();
            }

            String firmIdStr = jwtTokenProvider.getFirmId(token);
            UUID firmId = UUID.fromString(firmIdStr);
            UUID invoiceId = UUID.fromString(id);

            byte[] pdf = pdfService.generateInvoicePdf(invoiceId, firmId);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"invoice-" + id + ".pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);

        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}