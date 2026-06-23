package com.mentoriasg4.payment_service.service;

import com.mentoriasg4.payment_service.dto.CreatePreferenceRequest;
import com.mentoriasg4.payment_service.model.Payment;
import com.mentoriasg4.payment_service.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public Payment createPaymentRecord(CreatePreferenceRequest request) {
        Payment payment = new Payment();
        payment.setOfferId(request.getOfferId());
        payment.setStudentId(request.getStudentId());
        payment.setMentorId(request.getMentorId());
        payment.setAmount(request.getPrice());
        payment.setCurrency("CLP");
        payment.setStatus("PENDING");
        return paymentRepository.save(payment);
    }

    public Payment savePayment(Payment payment) {
        return paymentRepository.save(payment);
    }
}
