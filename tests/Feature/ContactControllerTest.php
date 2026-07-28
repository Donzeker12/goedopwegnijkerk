<?php

use App\Mail\ContactMail;
use Illuminate\Support\Facades\Mail;

it('sends the contact form to the business email', function () {
    Mail::fake();

    $payload = [
        'name' => 'Test Gebruiker',
        'email' => 'tester@example.com',
        'phone' => '0612345678',
        'subject' => 'Vraag over een scooter',
        'message' => 'Ik wil graag meer informatie over de beschikbaarheid.',
    ];

    $response = $this->post('/contact', $payload);

    $response->assertRedirect();

    Mail::assertSent(ContactMail::class, function (ContactMail $mail) use ($payload): bool {
        return $mail->hasTo('info@goedopwegnijkerk.nl')
            && $mail->data['name'] === $payload['name']
            && $mail->data['email'] === $payload['email'];
    });
});
