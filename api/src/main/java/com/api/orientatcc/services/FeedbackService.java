package com.api.orientatcc.services;

import com.api.orientatcc.model.Feedback;
import com.api.orientatcc.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    @Autowired
    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    // CRUD Feedback
    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAll();
    }

    public Optional<Feedback> getFeedbackById(Long id) {
        return feedbackRepository.findById(id);
    }

    public Feedback createFeedback(Feedback feedback) {
        return feedbackRepository.save(feedback);
    }

    public Optional<Feedback> updateFeedback(Long id, Feedback feedbackDetails) {
        return feedbackRepository.findById(id).map(feedback -> {
            feedback.setComentario(feedbackDetails.getComentario());
            return feedbackRepository.save(feedback);
        });
    }

    public void deleteFeedback(Long id) {
        feedbackRepository.deleteById(id);
    }
}
