# Centralized technology catalog (Devicon SVG URLs).
# Used by the admin "Add from catalog" picker and by the seeder.
TECH_CATALOG: list[dict] = [
    # ── Frontend ──────────────────────────────────────────────
    {"name": "HTML5", "slug": "html5", "category": "frontend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg"},
    {"name": "CSS3", "slug": "css3", "category": "frontend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg"},
    {"name": "JavaScript", "slug": "javascript", "category": "frontend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"},
    {"name": "TypeScript", "slug": "typescript", "category": "frontend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"},
    {"name": "React", "slug": "react", "category": "frontend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"},
    {"name": "Next.js", "slug": "nextjs", "category": "frontend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg"},
    {"name": "Vue.js", "slug": "vuejs", "category": "frontend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg"},
    {"name": "Angular", "slug": "angularjs", "category": "frontend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg"},
    {"name": "Svelte", "slug": "svelte", "category": "frontend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg"},
    {"name": "Redux", "slug": "redux", "category": "frontend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg"},
    {"name": "jQuery", "slug": "jquery", "category": "frontend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jquery/jquery-original.svg"},
    {"name": "Bootstrap", "slug": "bootstrap", "category": "frontend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg"},
    {"name": "Tailwind CSS", "slug": "tailwindcss", "category": "frontend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg"},
    {"name": "Sass", "slug": "sass", "category": "frontend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg"},
    {"name": "Material UI", "slug": "materialui", "category": "frontend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/materialui/materialui-original.svg"},
    {"name": "Vite", "slug": "vitejs", "category": "frontend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg"},
    {"name": "Webpack", "slug": "webpack", "category": "frontend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/webpack/webpack-original.svg"},
    {"name": "Babel", "slug": "babel", "category": "frontend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/babel/babel-original.svg"},
    {"name": "Storybook", "slug": "storybook", "category": "frontend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/storybook/storybook-original.svg"},
    {"name": "Three.js", "slug": "threejs", "category": "frontend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg"},
    {"name": "WebGL", "slug": "webgl", "category": "frontend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/webgl/webgl-original.svg"},

    # ── Backend ───────────────────────────────────────────────
    {"name": "Node.js", "slug": "nodejs", "category": "backend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"},
    {"name": "Express.js", "slug": "express", "category": "backend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg"},
    {"name": "NestJS", "slug": "nestjs", "category": "backend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg"},
    {"name": "Django", "slug": "django", "category": "backend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg"},
    {"name": "Flask", "slug": "flask", "category": "backend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg"},
    {"name": "FastAPI", "slug": "fastapi", "category": "backend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg"},
    {"name": "Laravel", "slug": "laravel", "category": "backend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg"},
    {"name": "PHP", "slug": "php", "category": "backend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg"},
    {"name": "Python", "slug": "python", "category": "backend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"},
    {"name": "Java", "slug": "java", "category": "backend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg"},
    {"name": "Spring", "slug": "spring", "category": "backend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg"},
    {"name": "C", "slug": "c", "category": "backend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg"},
    {"name": "C++", "slug": "cplusplus", "category": "backend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg"},
    {"name": "C#", "slug": "csharp", "category": "backend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg"},
    {"name": ".NET", "slug": "dotnetcore", "category": "backend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dotnetcore/dotnetcore-original.svg"},
    {"name": "Go", "slug": "go", "category": "backend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg"},
    {"name": "Rust", "slug": "rust", "category": "backend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg"},
    {"name": "Ruby", "slug": "ruby", "category": "backend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg"},
    {"name": "Rails", "slug": "rails", "category": "backend", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rails/rails-original-wordmark.svg"},

    # ── Database ──────────────────────────────────────────────
    {"name": "MySQL", "slug": "mysql", "category": "database", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg"},
    {"name": "PostgreSQL", "slug": "postgresql", "category": "database", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg"},
    {"name": "MongoDB", "slug": "mongodb", "category": "database", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg"},
    {"name": "Redis", "slug": "redis", "category": "database", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg"},
    {"name": "SQLite", "slug": "sqlite", "category": "database", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg"},
    {"name": "MariaDB", "slug": "mariadb", "category": "database", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mariadb/mariadb-original.svg"},
    {"name": "Oracle", "slug": "oracle", "category": "database", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oracle/oracle-original.svg"},
    {"name": "Microsoft SQL Server", "slug": "microsoftsqlserver", "category": "database", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoftsqlserver/microsoftsqlserver-plain.svg"},
    {"name": "Firebase", "slug": "firebase", "category": "database", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg"},
    {"name": "Supabase", "slug": "supabase", "category": "database", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg"},

    # ── Cloud / DevOps (mapped to tools) ──────────────────────
    {"name": "Docker", "slug": "docker", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg"},
    {"name": "Kubernetes", "slug": "kubernetes", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg"},
    {"name": "AWS", "slug": "amazonwebservices", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg"},
    {"name": "Azure", "slug": "azure", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg"},
    {"name": "Google Cloud", "slug": "googlecloud", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg"},
    {"name": "DigitalOcean", "slug": "digitalocean", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/digitalocean/digitalocean-original.svg"},
    {"name": "Nginx", "slug": "nginx", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg"},
    {"name": "Apache", "slug": "apache", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apache/apache-original.svg"},
    {"name": "Jenkins", "slug": "jenkins", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg"},
    {"name": "GitHub Actions", "slug": "githubactions", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/githubactions/githubactions-original.svg"},
    {"name": "Terraform", "slug": "terraform", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg"},
    {"name": "Ansible", "slug": "ansible", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ansible/ansible-original.svg"},
    {"name": "Helm", "slug": "helm", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/helm/helm-original.svg"},

    # ── Tools / Version Control (mapped to tools) ─────────────
    {"name": "Git", "slug": "git", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg"},
    {"name": "GitHub", "slug": "github", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"},
    {"name": "GitLab", "slug": "gitlab", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg"},
    {"name": "Bitbucket", "slug": "bitbucket", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bitbucket/bitbucket-original.svg"},
    {"name": "VS Code", "slug": "vscode", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg"},
    {"name": "IntelliJ", "slug": "intellij", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/intellij/intellij-original.svg"},
    {"name": "Postman", "slug": "postman", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg"},
    {"name": "npm", "slug": "npm", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg"},
    {"name": "Yarn", "slug": "yarn", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/yarn/yarn-original.svg"},
    {"name": "pnpm", "slug": "pnpm", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pnpm/pnpm-original.svg"},
    {"name": "Linux", "slug": "linux", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg"},
    {"name": "Ubuntu", "slug": "ubuntu", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ubuntu/ubuntu-original.svg"},
    {"name": "Bash", "slug": "bash", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg"},

    # ── Testing (mapped to tools) ─────────────────────────────
    {"name": "Jest", "slug": "jest", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jest/jest-plain.svg"},
    {"name": "Cypress", "slug": "cypressio", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cypressio/cypressio-original.svg"},
    {"name": "Mocha", "slug": "mocha", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mocha/mocha-original.svg"},
    {"name": "Selenium", "slug": "selenium", "category": "tools", "icon_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/selenium/selenium-original.svg"},
]


def catalog_by_slug(slug: str) -> dict | None:
    for item in TECH_CATALOG:
        if item["slug"] == slug:
            return item
    return None
