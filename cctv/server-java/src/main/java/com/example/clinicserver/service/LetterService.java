package com.example.clinicserver.service;

import com.example.clinicserver.model.Letter;
import com.example.clinicserver.repo.LetterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LetterService {
    
    @Autowired
    private LetterRepository letterRepository;

    // Create a new letter
    public Letter createLetter(Letter letter) {
        return letterRepository.save(letter);
    }

    // Get all letters
    public List<Letter> getAllLetters() {
        return letterRepository.findAll();
    }

    // Get letter by ID
    public Optional<Letter> getLetterById(String id) {
        return letterRepository.findById(id);
    }

    // Get letter by letter number
    public Optional<Letter> getLetterByNumber(String letterNumber) {
        return letterRepository.findByLetterNumber(letterNumber);
    }

    // Get letters for a specific user
    public List<Letter> getLettersByUser(String userId) {
        return letterRepository.findByUserId(userId);
    }

    // Get letters from a specific portal
    public List<Letter> getLettersByPortal(String portalId) {
        return letterRepository.findByPortalId(portalId);
    }

    // Get letters for a specific section
    public List<Letter> getLettersBySection(String sectionId) {
        return letterRepository.findBySectionId(sectionId);
    }

    // Get letters by status
    public List<Letter> getLettersByStatus(String status) {
        return letterRepository.findByStatus(status);
    }

    // Get letters by type
    public List<Letter> getLettersByType(String letterType) {
        return letterRepository.findByLetterType(letterType);
    }

    // Get user's letters in a specific portal
    public List<Letter> getUserLettersInPortal(String userId, String portalId) {
        return letterRepository.findByUserIdAndPortalId(userId, portalId);
    }

    // Get letters issued by a specific user
    public List<Letter> getLettersIssuedBy(String issuerUserId) {
        return letterRepository.findByIssuerUserId(issuerUserId);
    }

    // Update letter
    public Letter updateLetter(String id, Letter letterDetails) {
        Optional<Letter> optionalLetter = letterRepository.findById(id);
        if (optionalLetter.isPresent()) {
            Letter letter = optionalLetter.get();
            if (letterDetails.getTitle() != null) letter.setTitle(letterDetails.getTitle());
            if (letterDetails.getContent() != null) letter.setContent(letterDetails.getContent());
            if (letterDetails.getStatus() != null) letter.setStatus(letterDetails.getStatus());
            if (letterDetails.getExpiresAt() != null) letter.setExpiresAt(letterDetails.getExpiresAt());
            if (letterDetails.getAttachmentUrl() != null) letter.setAttachmentUrl(letterDetails.getAttachmentUrl());
            if (letterDetails.getRemarks() != null) letter.setRemarks(letterDetails.getRemarks());
            return letterRepository.save(letter);
        }
        return null;
    }

    // Issue letter (change status from draft to issued)
    public Letter issueLetter(String id, String issuerUserId) {
        Optional<Letter> optionalLetter = letterRepository.findById(id);
        if (optionalLetter.isPresent()) {
            Letter letter = optionalLetter.get();
            letter.setStatus("issued");
            letter.setIssuedAt(LocalDateTime.now());
            letter.setIssuerUserId(issuerUserId);
            return letterRepository.save(letter);
        }
        return null;
    }

    // Acknowledge letter (mark as acknowledged by recipient)
    public Letter acknowledgeLetter(String id) {
        Optional<Letter> optionalLetter = letterRepository.findById(id);
        if (optionalLetter.isPresent()) {
            Letter letter = optionalLetter.get();
            letter.setStatus("acknowledged");
            letter.setAcknowledgedAt(LocalDateTime.now());
            return letterRepository.save(letter);
        }
        return null;
    }

    // Approve letter (by HOD/Admin)
    public Letter approveLetter(String id, String approverUserId) {
        Optional<Letter> optionalLetter = letterRepository.findById(id);
        if (optionalLetter.isPresent()) {
            Letter letter = optionalLetter.get();
            letter.setApproverUserId(approverUserId);
            letter.setStatus("issued");
            return letterRepository.save(letter);
        }
        return null;
    }

    // Get expired letters
    public List<Letter> getExpiredLetters() {
        return letterRepository.findByExpiresAtBefore(LocalDateTime.now());
    }

    // Auto-expire old letters
    public void expireOldLetters() {
        List<Letter> expiredLetters = getExpiredLetters();
        for (Letter letter : expiredLetters) {
            if (!letter.getStatus().equals("expired")) {
                letter.setStatus("expired");
                letterRepository.save(letter);
            }
        }
    }

    // Delete letter
    public void deleteLetter(String id) {
        letterRepository.deleteById(id);
    }
}
