package com.example.clinicserver.controller;

import com.example.clinicserver.model.Letter;
import com.example.clinicserver.service.LetterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/letters")
@CrossOrigin(origins = "*")
public class LetterController {
    
    @Autowired
    private LetterService letterService;

    @PostMapping
    public ResponseEntity<Letter> createLetter(@RequestBody Letter letter) {
        Letter createdLetter = letterService.createLetter(letter);
        return new ResponseEntity<>(createdLetter, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Letter>> getAllLetters() {
        List<Letter> letters = letterService.getAllLetters();
        return new ResponseEntity<>(letters, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Letter> getLetterById(@PathVariable String id) {
        Optional<Letter> letter = letterService.getLetterById(id);
        return letter.map(l -> new ResponseEntity<>(l, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/number/{letterNumber}")
    public ResponseEntity<Letter> getLetterByNumber(@PathVariable String letterNumber) {
        Optional<Letter> letter = letterService.getLetterByNumber(letterNumber);
        return letter.map(l -> new ResponseEntity<>(l, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Letter>> getLettersByUser(@PathVariable String userId) {
        List<Letter> letters = letterService.getLettersByUser(userId);
        return new ResponseEntity<>(letters, HttpStatus.OK);
    }

    @GetMapping("/portal/{portalId}")
    public ResponseEntity<List<Letter>> getLettersByPortal(@PathVariable String portalId) {
        List<Letter> letters = letterService.getLettersByPortal(portalId);
        return new ResponseEntity<>(letters, HttpStatus.OK);
    }

    @GetMapping("/section/{sectionId}")
    public ResponseEntity<List<Letter>> getLettersBySection(@PathVariable String sectionId) {
        List<Letter> letters = letterService.getLettersBySection(sectionId);
        return new ResponseEntity<>(letters, HttpStatus.OK);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Letter>> getLettersByStatus(@PathVariable String status) {
        List<Letter> letters = letterService.getLettersByStatus(status);
        return new ResponseEntity<>(letters, HttpStatus.OK);
    }

    @GetMapping("/type/{letterType}")
    public ResponseEntity<List<Letter>> getLettersByType(@PathVariable String letterType) {
        List<Letter> letters = letterService.getLettersByType(letterType);
        return new ResponseEntity<>(letters, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}/portal/{portalId}")
    public ResponseEntity<List<Letter>> getUserLettersInPortal(@PathVariable String userId, @PathVariable String portalId) {
        List<Letter> letters = letterService.getUserLettersInPortal(userId, portalId);
        return new ResponseEntity<>(letters, HttpStatus.OK);
    }

    @GetMapping("/issued-by/{issuerUserId}")
    public ResponseEntity<List<Letter>> getLettersIssuedBy(@PathVariable String issuerUserId) {
        List<Letter> letters = letterService.getLettersIssuedBy(issuerUserId);
        return new ResponseEntity<>(letters, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Letter> updateLetter(@PathVariable String id, @RequestBody Letter letterDetails) {
        Letter updatedLetter = letterService.updateLetter(id, letterDetails);
        if (updatedLetter != null) {
            return new ResponseEntity<>(updatedLetter, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PatchMapping("/{id}/issue")
    public ResponseEntity<Letter> issueLetter(@PathVariable String id, @RequestParam String issuerUserId) {
        Letter letter = letterService.issueLetter(id, issuerUserId);
        if (letter != null) {
            return new ResponseEntity<>(letter, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PatchMapping("/{id}/acknowledge")
    public ResponseEntity<Letter> acknowledgeLetter(@PathVariable String id) {
        Letter letter = letterService.acknowledgeLetter(id);
        if (letter != null) {
            return new ResponseEntity<>(letter, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<Letter> approveLetter(@PathVariable String id, @RequestParam String approverUserId) {
        Letter letter = letterService.approveLetter(id, approverUserId);
        if (letter != null) {
            return new ResponseEntity<>(letter, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping("/expired/list")
    public ResponseEntity<List<Letter>> getExpiredLetters() {
        List<Letter> letters = letterService.getExpiredLetters();
        return new ResponseEntity<>(letters, HttpStatus.OK);
    }

    @PostMapping("/maintenance/expire-old")
    public ResponseEntity<String> expireOldLetters() {
        letterService.expireOldLetters();
        return new ResponseEntity<>("Expired old letters", HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLetter(@PathVariable String id) {
        letterService.deleteLetter(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
