<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OperationHistory extends Model
{
    protected $fillable = [
        'good_id',
        'user_id',
        'operation_type',
        'amount',
        'before_count',
        'after_count',
        'description',
    ];

    public function good(): BelongsTo
    {
        return $this->belongsTo(Good::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
