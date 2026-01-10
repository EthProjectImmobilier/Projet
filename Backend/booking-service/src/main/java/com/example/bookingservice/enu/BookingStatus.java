package com.example.bookingservice.enu;

public enum BookingStatus {
    DRAFT,              // En cours de création côté frontend
    PENDING_PAYMENT,    // Créé, en attente de paiement
    PAYMENT_PROCESSING, // Paiement en cours de traitement
    CONFIRMED,          // Paiement confirmé, booking actif
    CANCELLED,          // Annulé avant check-in
    ACTIVE,             // En cours (check-in fait)
    COMPLETED,          // Séjour terminé
    DISPUTED            // Litige en cours
}
