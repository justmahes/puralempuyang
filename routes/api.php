<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OperatorController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\WeatherController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth.jwt')->group(function () {
        Route::get('me', [AuthController::class, 'profile']);
        Route::put('profile', [AuthController::class, 'updateProfile']);
    });
});

Route::get('tickets/slots', [TicketController::class, 'slots']);
Route::get('tickets/types', [TicketController::class, 'types']);
Route::get('weather', [WeatherController::class, 'show']);

Route::middleware('auth.jwt')->group(function () {
    Route::get('orders', [OrderController::class, 'index']);
    Route::post('orders', [OrderController::class, 'store']);
    Route::get('orders/show', [OrderController::class, 'show']);

    Route::post('payments/token', [PaymentController::class, 'snapToken']);
    Route::post('payments/verify', [PaymentController::class, 'verify']);

    Route::get('operator/tickets', [OperatorController::class, 'tickets'])->middleware('role:operator,admin');
    Route::get('operator/stats', [OperatorController::class, 'stats'])->middleware('role:operator,admin');
    Route::post('operator/validate', [OperatorController::class, 'validateTicket'])->middleware('role:operator,admin');

    Route::middleware('role:admin')->group(function () {
        Route::get('admin/overview', [AdminController::class, 'overview']);
        Route::get('admin/orders', [AdminController::class, 'orders']);
        Route::get('admin/transactions/export', [AdminController::class, 'export']);
        Route::post('admin/operators', [AdminController::class, 'storeOperator']);
        Route::delete('admin/operators', [AdminController::class, 'deleteOperator']);

        Route::get('admin/slots', [TicketController::class, 'adminSlots']);
        Route::post('admin/slots', [TicketController::class, 'createSlot']);
        Route::put('admin/slots', [TicketController::class, 'updateSlot']);
        Route::delete('admin/slots', [TicketController::class, 'deleteSlot']);

        Route::post('tickets', [TicketController::class, 'store']);
        Route::put('tickets', [TicketController::class, 'update']);
        Route::delete('tickets', [TicketController::class, 'destroy']);
    });
});

Route::post('payments/callback', [PaymentController::class, 'callback']);
