package com.homevista.homevista.service;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private final ObjectProvider<JavaMailSender> senderProvider;
    private final String fromAddress;
    private final String baseUrl;

    public MailService(ObjectProvider<JavaMailSender> senderProvider,
                       @Value("${spring.mail.username:}") String fromAddress,
                       @Value("${homevista.base-url:http://localhost:8080}") String baseUrl) {
        this.senderProvider = senderProvider;
        this.fromAddress = fromAddress;
        this.baseUrl = baseUrl;
    }

    // Email settings bhari hain ya nahi
    public boolean isConfigured() {
        return senderProvider.getIfAvailable() != null
                && fromAddress != null && !fromAddress.isBlank();
    }

    // true = email Gmail ko de di gayi, false = nahi gayi
    public boolean sendResetCode(String to, String code) {

        if (!isConfigured()) {
            System.out.println(">>> Email is NOT configured. Set spring.mail.username and "
                    + "spring.mail.password in local.properties, then restart the app.");
            return false;
        }

        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(fromAddress);
            mail.setTo(to);
            mail.setSubject("HomeVista password reset code");
            mail.setText(
                    "Hello,\n\n"
                  + "Your HomeVista password reset code is:\n\n"
                  + code + "\n\n"
                  + "It is valid for 15 minutes. Enter it here: " + baseUrl + "/reset-password.html\n\n"
                  + "If you did not ask for this, you can ignore this email.");

            senderProvider.getObject().send(mail);

            System.out.println(">>> Reset email was handed to the mail server for delivery.");
            return true;

        } catch (Exception e) {
            Throwable root = e;
            while (root.getCause() != null) {
                root = root.getCause();
            }
            System.out.println(">>> Email could not be sent: "
                    + e.getClass().getSimpleName() + " - " + root.getMessage());
            return false;
        }
    }
}