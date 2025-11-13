<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

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
            if (!empty($ticket['qr_path']) && file_exists($ticket['qr_path'])) {
                $attachments[] = Attachment::fromPath($ticket['qr_path'])
                    ->as($ticket['ticket_code'] . '.png')
                    ->withMime('image/png');
            }
        }
        return $attachments;
    }
}
