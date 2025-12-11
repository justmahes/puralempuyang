<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OperatorController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\WeatherController;
use App\Http\Controllers\Api\PhotoQueueController;
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
        Route::get('operator/snapshot', [OperatorController::class, 'snapshot'])->middleware('role:operator,admin');
        Route::post('operator/validate/batch', [OperatorController::class, 'validateBatch'])->middleware('role:operator,admin');

        Route::middleware('role:admin')->group(function () {
        Route::get('admin/overview', [AdminController::class, 'overview']);
        Route::get('admin/orders', [AdminController::class, 'orders']);
        Route::get('admin/transactions/export', [AdminController::class, 'export']);
        Route::post('admin/operators', [AdminController::class, 'storeOperator']);
        Route::delete('admin/operators', [AdminController::class, 'deleteOperator']);
        Route::get('admin/users', [AdminController::class, 'users']);
        Route::delete('admin/users', [AdminController::class, 'deleteUser']);

        Route::get('admin/slots', [TicketController::class, 'adminSlots']);
        Route::post('admin/slots', [TicketController::class, 'createSlot']);
        Route::put('admin/slots', [TicketController::class, 'updateSlot']);
        Route::delete('admin/slots', [TicketController::class, 'deleteSlot']);

        Route::post('tickets', [TicketController::class, 'store']);
        Route::put('tickets', [TicketController::class, 'update']);
            Route::delete('tickets', [TicketController::class, 'destroy']);

            // Admin manage photo points
            Route::get('admin/photo-points', [PhotoQueueController::class, 'adminPoints']);
            Route::post('admin/photo-points', [PhotoQueueController::class, 'createPoint']);
            Route::put('admin/photo-points', [PhotoQueueController::class, 'updatePoint']);
            Route::delete('admin/photo-points', [PhotoQueueController::class, 'deletePoint']);
        });

        // Photo queue (operator & admin)
        Route::get('photo/points', [PhotoQueueController::class, 'points'])->middleware('role:operator,admin');
        Route::get('photo/queue', [PhotoQueueController::class, 'list'])->middleware('role:operator,admin');
        Route::post('photo/queue/call-next', [PhotoQueueController::class, 'callNext'])->middleware('role:operator,admin');
        Route::post('photo/queue/mark-shooting', [PhotoQueueController::class, 'markShooting'])->middleware('role:operator,admin');
        Route::post('photo/queue/complete', [PhotoQueueController::class, 'complete'])->middleware('role:operator,admin');
        Route::post('photo/queue/skip', [PhotoQueueController::class, 'skip'])->middleware('role:operator,admin');
        Route::post('photo/queue/recall', [PhotoQueueController::class, 'recall'])->middleware('role:operator,admin');
        Route::post('photo/upload', [PhotoQueueController::class, 'upload'])->middleware('role:operator,admin');
    });

Route::post('payments/callback', [PaymentController::class, 'callback']);

// Public/user endpoints for photo queue
Route::middleware('auth.jwt')->group(function () {
    Route::post('photo-queue/enqueue', [PhotoQueueController::class, 'enqueue']);
    Route::get('photo-queue/status', [PhotoQueueController::class, 'status']);
    Route::get('photo/my-assets', [PhotoQueueController::class, 'myAssets']);
});
