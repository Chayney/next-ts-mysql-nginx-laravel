# Next.js×TypeScript×MySQL×Nginx×Laravel  
※環境構築がメインです。  
Docker環境で構築しフロントエンドはNext.js、バックエンドはLaravelでAPIを取得しています。  

## Laravel Sanctum SPA認証 
### Sanctumのインストール
$docker-compose exec php bash  
composer require laravel/sanctum  
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"  
php artisan migrate  

### Sanctumのセットアップ  
config/sanctum.phpで確認  
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,localhost:3000')),  

.envで追加  
SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost  

.envの編集後は自動的に編集内容が反映しないのではキャッシュをクリア  
php artisan config:clear
php artisan cache:clear  

app/Http/Kernel.php
## 接続先
Next.js http://localhost:3000/  
Laravel http://localhost  
MySQL http://localhost:8080
