<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_slots_endpoint_is_accessible(): void
    {
        $this->seed();

        $response = $this->getJson('/api/tickets/slots');

        $response->assertStatus(200);
    }
}
