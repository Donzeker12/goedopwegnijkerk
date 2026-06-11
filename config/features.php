<?php

return [
    'loyalty_pass_public' => (bool) env('FEATURE_LOYALTY_PASS_PUBLIC', false),
    'loyalty_pass_admin_preview' => (bool) env('FEATURE_LOYALTY_PASS_ADMIN_PREVIEW', true),
];
