package com.livre.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Model representing a single journal entry in Lumière.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JournalEntry {
    private String id;
    private String title;
    private String content;
    private LocalDateTime date;
    private double sentimentScore;
    private List<String> tags;
    private String userId;

    // Fields for image and display properties
    private String dateKey;
    private String imageUrl;
    private String thumbnailUrl;
    private String caption;
    private boolean isLandscape;
}
