use crate::models::IntegrationsConfig;

pub fn baas_label(provider: &str) -> &str {
    match provider {
        "neon" => "Neon",
        "supabase" => "Supabase",
        "nile" => "Nile",
        "prisma-postgres" => "Prisma Postgres",
        "aws-aurora-postgres" => "Aurora PostgreSQL",
        "aws-aurora-dsql" => "Aurora DSQL",
        "turso" => "Turso",
        "mongodb-atlas" => "MongoDB Atlas",
        "aws-dynamodb" => "DynamoDB",
        "convex" => "Convex",
        "firebase" => "Firebase",
        "upstash-redis" => "Upstash Redis",
        "vercel-redis" => "Vercel Redis",
        "upstash-vector" => "Upstash Vector",
        "upstash-qstash" => "Upstash QStash",
        "upstash-search" => "Upstash Search",
        "motherduck" => "MotherDuck",
        "none" => "Yok",
        other => other,
    }
}

fn push_if(lines: &mut Vec<String>, key: &str, value: &str) {
    if !value.trim().is_empty() {
        lines.push(format!("{key}={}", value.trim()));
    }
}

pub fn append_baas_env(lines: &mut Vec<String>, integrations: &IntegrationsConfig) {
    let url = integrations.database_url.trim();
    let token = integrations.database_token.trim();
    let secret = integrations.database_secret.trim();

    match integrations.baas_provider.as_str() {
        "supabase" => {
            if !integrations.supabase_url.trim().is_empty() {
                push_if(lines, "NEXT_PUBLIC_SUPABASE_URL", &integrations.supabase_url);
                push_if(lines, "SUPABASE_URL", &integrations.supabase_url);
            }
            if !integrations.supabase_anon_key.trim().is_empty() {
                push_if(lines, "NEXT_PUBLIC_SUPABASE_ANON_KEY", &integrations.supabase_anon_key);
                push_if(lines, "SUPABASE_ANON_KEY", &integrations.supabase_anon_key);
            }
            if !integrations.supabase_service_key.trim().is_empty() {
                push_if(lines, "SUPABASE_SERVICE_ROLE_KEY", &integrations.supabase_service_key);
            }
        }
        "firebase" => {
            if !integrations.firebase_api_key.trim().is_empty() {
                push_if(lines, "NEXT_PUBLIC_FIREBASE_API_KEY", &integrations.firebase_api_key);
            }
            if !integrations.firebase_auth_domain.trim().is_empty() {
                push_if(lines, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", &integrations.firebase_auth_domain);
            }
            if !integrations.firebase_project_id.trim().is_empty() {
                push_if(lines, "NEXT_PUBLIC_FIREBASE_PROJECT_ID", &integrations.firebase_project_id);
            }
            if !integrations.firebase_app_id.trim().is_empty() {
                push_if(lines, "NEXT_PUBLIC_FIREBASE_APP_ID", &integrations.firebase_app_id);
            }
        }
        "neon" | "nile" | "prisma-postgres" | "aws-aurora-postgres" | "aws-aurora-dsql" => {
            push_if(lines, "DATABASE_URL", url);
        }
        "turso" => {
            push_if(lines, "TURSO_DATABASE_URL", url);
            push_if(lines, "TURSO_AUTH_TOKEN", token);
        }
        "mongodb-atlas" => {
            push_if(lines, "MONGODB_URI", url);
        }
        "aws-dynamodb" => {
            push_if(lines, "AWS_REGION", url);
            push_if(lines, "AWS_ACCESS_KEY_ID", token);
            push_if(lines, "AWS_SECRET_ACCESS_KEY", secret);
        }
        "convex" => {
            push_if(lines, "NEXT_PUBLIC_CONVEX_URL", url);
            push_if(lines, "CONVEX_DEPLOY_KEY", token);
        }
        "upstash-redis" => {
            push_if(lines, "UPSTASH_REDIS_REST_URL", url);
            push_if(lines, "UPSTASH_REDIS_REST_TOKEN", token);
            push_if(lines, "REDIS_URL", url);
        }
        "vercel-redis" => {
            push_if(lines, "KV_REST_API_URL", url);
            push_if(lines, "KV_REST_API_TOKEN", token);
        }
        "upstash-vector" => {
            push_if(lines, "UPSTASH_VECTOR_REST_URL", url);
            push_if(lines, "UPSTASH_VECTOR_REST_TOKEN", token);
        }
        "upstash-qstash" => {
            push_if(lines, "QSTASH_URL", url);
            push_if(lines, "QSTASH_TOKEN", token);
        }
        "upstash-search" => {
            push_if(lines, "UPSTASH_SEARCH_REST_URL", url);
            push_if(lines, "UPSTASH_SEARCH_REST_TOKEN", token);
        }
        "motherduck" => {
            push_if(lines, "MOTHERDUCK_TOKEN", url);
            if !token.is_empty() {
                push_if(lines, "MOTHERDUCK_DATABASE", token);
            }
        }
        _ => {}
    }
}

pub fn baas_prompt_note(provider: &str) -> String {
    match provider {
        "supabase" => {
            "Supabase entegrasyonu mevcut — auth ve DB için Supabase client kullan.".into()
        }
        "firebase" => {
            "Firebase entegrasyonu mevcut — auth ve Firestore için Firebase SDK kullan.".into()
        }
        "neon" | "prisma-postgres" | "nile" | "aws-aurora-postgres" | "aws-aurora-dsql" => {
            format!("{} Postgres — DATABASE_URL .env.local'da hazır.", baas_label(provider))
        }
        "turso" => "Turso libSQL — edge-ready SQLite kullan.".into(),
        "mongodb-atlas" => "MongoDB Atlas — MONGODB_URI ile bağlan.".into(),
        "convex" => "Convex reaktif backend — real-time sync kullan.".into(),
        "aws-dynamodb" => "AWS DynamoDB — SDK ile NoSQL erişimi.".into(),
        "upstash-redis" | "vercel-redis" => {
            format!("{} — cache ve session için Redis REST API.", baas_label(provider))
        }
        "upstash-vector" => "Upstash Vector — embedding arama için.".into(),
        "upstash-qstash" => "Upstash QStash — arka plan işleri ve kuyruk.".into(),
        "upstash-search" => "Upstash Search — tam metin arama.".into(),
        "motherduck" => "MotherDuck — analitik sorgular için DuckDB.".into(),
        _ => String::new(),
    }
}
