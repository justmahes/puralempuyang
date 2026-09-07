<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class TicketIssued extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public array $user, public array $order, public array $tickets)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'E-ticket Pura Lempuyang #' . $this->order['order_code'],
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.tickets.issued',
            with: [
                'user' => $this->user,
                'order' => $this->order,
                'tickets' => $this->tickets,
            ],
        );
    }

    public function attachments(): array
    {
        $attachments = [];
        foreach ($this->tickets as $ticket) {
            if (empty($ticket['qr_path'])) {
                continue;
            }

            // qr_path relatif terhadap disk "public"; file_exists butuh path absolut.
            $absolute = Storage::disk('public')->path($ticket['qr_path']);
            if (!file_exists($absolute)) {
                continue;
            }

            $attachments[] = Attachment::fromPath($absolute)
                ->as($ticket['ticket_code'] . '.svg')
                ->withMime('image/svg+xml');
        }
        return $attachments;
    }
}
