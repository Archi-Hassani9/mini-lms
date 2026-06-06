-- =============================================================================
-- Mini LMS — Seed Data
-- Project   : AVGC XR Solutions Technical Assessment — Mini LMS
-- Author    : Database Architect
-- Created   : 2026-06-04
-- Version   : 1.0.0
--
-- IMPORTANT — PASSWORD HASHES
-- ----------------------------
-- The password values stored below are PLACEHOLDER strings.
-- Real Django PBKDF2-SHA256 hashes MUST be generated before use.
--
-- To regenerate the real hashes, open a Django shell:
--
--   python manage.py shell
--
-- Then run:
--
--   from django.contrib.auth.hashers import make_password
--   print(make_password('Admin@123'))      # admin password
--   print(make_password('Student@2024'))   # student password
--
-- Replace the placeholder values below with the output of make_password().
--
-- RUNNING THIS SEED
-- -----------------
-- Option A — MySQL CLI:
--   mysql -u root -p mini_lms < database/seed.sql
--
-- Option B — Django management command (recommended):
--   python manage.py seed_data
--   (Requires a custom management command at
--    lms/management/commands/seed_data.py)
--
-- Option C — Django shell:
--   exec(open('database/seed.sql').read())   # not recommended; use A or B
-- =============================================================================

USE mini_lms;

-- Disable FK checks during bulk insert to allow flexible ordering
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================================
-- TRUNCATE (clean slate before seeding — safe for development only)
-- =============================================================================
TRUNCATE TABLE progress;
TRUNCATE TABLE submissions;
TRUNCATE TABLE assignments;
TRUNCATE TABLE enrollments;
TRUNCATE TABLE lessons;
TRUNCATE TABLE courses;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;

-- Re-enable FK checks
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 1. roles
-- =============================================================================
INSERT INTO roles (id, name) VALUES
  (1, 'Admin'),
  (2, 'Student');

-- =============================================================================
-- 2. users
--
--  Password placeholder: django_pbkdf2_placeholder_see_readme
--  Replace with the output of Django's make_password() before going to prod.
--
--  Credentials for testing:
--    admin@lms.com        → Admin@123
--    sarah.johnson@...    → Student@2024
--    michael.chen@...     → Student@2024
--    priya.sharma@...     → Student@2024
--    luca.rossi@...       → Student@2024
--    amara.okafor@...     → Student@2024
-- =============================================================================
INSERT INTO users (id, role_id, full_name, email, password, is_active) VALUES
  -- Admin
  (1,  1, 'Admin User',        'admin@lms.com',                    'django_pbkdf2_placeholder_see_readme', TRUE),
  -- Students
  (2,  2, 'Sarah Johnson',     'sarah.johnson@example.com',        'django_pbkdf2_placeholder_see_readme', TRUE),
  (3,  2, 'Michael Chen',      'michael.chen@example.com',         'django_pbkdf2_placeholder_see_readme', TRUE),
  (4,  2, 'Priya Sharma',      'priya.sharma@example.com',         'django_pbkdf2_placeholder_see_readme', TRUE),
  (5,  2, 'Luca Rossi',        'luca.rossi@example.com',           'django_pbkdf2_placeholder_see_readme', TRUE),
  (6,  2, 'Amara Okafor',      'amara.okafor@example.com',         'django_pbkdf2_placeholder_see_readme', TRUE);

-- =============================================================================
-- 3. courses  (created by admin user id=1)
-- =============================================================================
INSERT INTO courses (id, title, description, thumbnail, category, created_by) VALUES
  (1, 'Full-Stack Web Development',
      'A comprehensive course covering HTML, CSS, JavaScript, React, Node.js, and PostgreSQL. Students will build three production-ready web applications and deploy them to AWS.',
      'https://cdn.mini-lms.dev/thumbnails/web-development.jpg',
      'Programming',
      1),

  (2, 'Data Science with Python',
      'Master data analysis, visualisation, machine learning, and deep learning using Python, Pandas, NumPy, Matplotlib, Scikit-learn, and TensorFlow. Includes five end-to-end data projects.',
      'https://cdn.mini-lms.dev/thumbnails/data-science.jpg',
      'Data Science',
      1),

  (3, 'UI/UX Design Fundamentals',
      'Learn user research, wireframing, prototyping, and visual design using Figma and Adobe XD. Students will design a complete mobile app from brief to hi-fi prototype.',
      'https://cdn.mini-lms.dev/thumbnails/uiux-design.jpg',
      'Design',
      1),

  (4, 'Python Programming Bootcamp',
      'From absolute beginner to confident Python developer. Covers variables, control flow, OOP, file I/O, REST API consumption, and automated testing with pytest.',
      'https://cdn.mini-lms.dev/thumbnails/python-programming.jpg',
      'Programming',
      1),

  (5, 'Digital Marketing Strategy',
      'A practical guide to SEO, Google Ads, Facebook/Instagram advertising, email marketing, content strategy, and analytics. Includes live campaign walkthroughs and Google Analytics 4 training.',
      'https://cdn.mini-lms.dev/thumbnails/digital-marketing.jpg',
      'Marketing',
      1);

-- =============================================================================
-- 4. lessons
-- =============================================================================

-- Course 1 — Full-Stack Web Development (4 lessons)
INSERT INTO lessons (id, course_id, title, content, video_url, order_no) VALUES
  (1,  1, 'HTML5 & Semantic Markup',
      'Learn the building blocks of the web. This lesson covers HTML5 document structure, semantic elements (<article>, <section>, <nav>, <header>, <footer>), forms, tables, and accessibility best practices (ARIA roles, alt text, label associations). By the end you will be able to write accessible, SEO-friendly HTML from scratch.',
      'https://videos.mini-lms.dev/web-dev/lesson-01-html5.mp4', 1),

  (2,  1, 'Modern CSS & Responsive Design',
      'Dive into CSS3 including Flexbox, CSS Grid, custom properties (variables), media queries, and the mobile-first design philosophy. We build a fully responsive landing page that works flawlessly from 320 px to 4 K screens.',
      'https://videos.mini-lms.dev/web-dev/lesson-02-css3.mp4', 2),

  (3,  1, 'JavaScript Fundamentals & ES2024',
      'Core JavaScript concepts: data types, closures, Promises, async/await, the event loop, and modern ES2024 features. We refactor a callback-heavy codebase into clean async code, and integrate a public REST API using the Fetch API.',
      'https://videos.mini-lms.dev/web-dev/lesson-03-javascript.mp4', 3),

  (4,  1, 'Building REST APIs with Node.js & Express',
      'Set up a production-grade Express server with JWT authentication, input validation (Joi), error handling middleware, rate limiting, and a PostgreSQL database via Sequelize ORM. We also write integration tests with Supertest.',
      'https://videos.mini-lms.dev/web-dev/lesson-04-nodejs.mp4', 4);

-- Course 2 — Data Science with Python (4 lessons)
INSERT INTO lessons (id, course_id, title, content, video_url, order_no) VALUES
  (5,  2, 'Python for Data Analysis with Pandas',
      'Introduction to the Pandas library: Series, DataFrames, indexing, filtering, groupby aggregations, merging datasets, handling missing values, and exporting results to CSV and Excel. We analyse a real-world e-commerce dataset throughout the lesson.',
      'https://videos.mini-lms.dev/data-science/lesson-01-pandas.mp4', 1),

  (6,  2, 'Data Visualisation with Matplotlib & Seaborn',
      'Create publication-quality charts: line, bar, scatter, histogram, heatmap, and pair plots. We explore storytelling with data — choosing the right chart type, colour palettes, annotation, and exporting figures for reports.',
      'https://videos.mini-lms.dev/data-science/lesson-02-visualisation.mp4', 2),

  (7,  2, 'Machine Learning with Scikit-learn',
      'Understand the ML workflow: train/test split, feature engineering, model selection (linear regression, decision trees, random forests, SVM), cross-validation, hyperparameter tuning with GridSearchCV, and model evaluation (precision, recall, ROC-AUC).',
      'https://videos.mini-lms.dev/data-science/lesson-03-sklearn.mp4', 3),

  (8,  2, 'Neural Networks & Deep Learning with TensorFlow',
      'Build, train, and evaluate neural networks using Keras (TensorFlow 2.x). Topics include dense layers, activation functions, dropout regularisation, batch normalisation, callbacks (EarlyStopping, ModelCheckpoint), and deploying a model as a REST API.',
      'https://videos.mini-lms.dev/data-science/lesson-04-tensorflow.mp4', 4);

-- Course 3 — UI/UX Design Fundamentals (3 lessons)
INSERT INTO lessons (id, course_id, title, content, video_url, order_no) VALUES
  (9,  3, 'User Research & Personas',
      'Learn how to conduct user interviews, competitive analysis, and usability tests. We synthesise research into user personas and journey maps that drive design decisions. Practical exercise: conduct a five-person guerrilla research session and document findings.',
      'https://videos.mini-lms.dev/uiux/lesson-01-research.mp4', 1),

  (10, 3, 'Wireframing & Prototyping in Figma',
      'From low-fidelity sketches to interactive prototypes. This lesson walks through Figma fundamentals: frames, components, auto-layout, variants, and the interactive prototype mode. We create a complete wireframe for a food-delivery mobile app.',
      'https://videos.mini-lms.dev/uiux/lesson-02-figma.mp4', 2),

  (11, 3, 'Visual Design & Design Systems',
      'Principles of visual design: typography hierarchy, colour theory, spacing systems (8-pt grid), iconography, and accessibility (WCAG 2.1 AA contrast ratios). We build a reusable component library and apply it to produce a polished, hi-fi mockup.',
      'https://videos.mini-lms.dev/uiux/lesson-03-visual-design.mp4', 3);

-- Course 4 — Python Programming Bootcamp (4 lessons)
INSERT INTO lessons (id, course_id, title, content, video_url, order_no) VALUES
  (12, 4, 'Python Basics: Variables, Types & Control Flow',
      'Install Python and VS Code. Understand variables, primitive types (int, float, str, bool), type casting, arithmetic/comparison/logical operators, if/elif/else branching, for/while loops, and list comprehensions. Build a simple CLI number-guessing game.',
      'https://videos.mini-lms.dev/python/lesson-01-basics.mp4', 1),

  (13, 4, 'Functions, Modules & Packages',
      'Define reusable functions with positional, keyword, and default arguments; understand *args and **kwargs. Explore Python''s standard library (os, sys, datetime, json, re). Learn how to structure a project with modules and packages, and publish a package to PyPI.',
      'https://videos.mini-lms.dev/python/lesson-02-functions.mp4', 2),

  (14, 4, 'Object-Oriented Programming in Python',
      'Classes, instances, __init__, instance vs class attributes, methods, inheritance, method overriding, super(), dunder methods (__str__, __repr__, __len__), and dataclasses. We model a library management system to cement every OOP concept.',
      'https://videos.mini-lms.dev/python/lesson-03-oop.mp4', 3),

  (15, 4, 'Testing with pytest & Code Quality',
      'Write unit tests and integration tests with pytest. Learn fixtures, parametrize, mocking (unittest.mock), measuring code coverage with pytest-cov, enforcing style with Flake8 and Black, and setting up a pre-commit hook pipeline.',
      'https://videos.mini-lms.dev/python/lesson-04-testing.mp4', 4);

-- Course 5 — Digital Marketing Strategy (3 lessons)
INSERT INTO lessons (id, course_id, title, content, video_url, order_no) VALUES
  (16, 5, 'SEO: From Fundamentals to Technical Mastery',
      'Understand how search engines crawl, index, and rank pages. Topics: keyword research (Google Keyword Planner, Ahrefs, Semrush), on-page optimisation, technical SEO (Core Web Vitals, structured data, XML sitemaps, robots.txt), and building high-quality backlinks.',
      'https://videos.mini-lms.dev/marketing/lesson-01-seo.mp4', 1),

  (17, 5, 'Paid Advertising: Google Ads & Meta Campaigns',
      'Set up and optimise Google Search, Display, and Shopping campaigns. Then transition to Meta Ads Manager — audience targeting, lookalike audiences, A/B testing creatives, retargeting, and measuring ROAS. We manage a live $500 test budget together.',
      'https://videos.mini-lms.dev/marketing/lesson-02-paid-ads.mp4', 2),

  (18, 5, 'Analytics & Conversion Rate Optimisation',
      'Configure Google Analytics 4 (GA4) with custom events, goals, and e-commerce tracking. Use Google Tag Manager for tag governance. Learn heatmaps (Hotjar), session recordings, funnel analysis, and CRO techniques (hypothesis-driven A/B tests, landing page optimisation).',
      'https://videos.mini-lms.dev/marketing/lesson-03-analytics.mp4', 3);

-- =============================================================================
-- 5. enrollments
--    Sarah   → Web Dev, Data Science, Python Bootcamp
--    Michael → Web Dev, UI/UX Design
--    Priya   → Data Science, UI/UX Design, Digital Marketing
--    Luca    → Python Bootcamp, Digital Marketing
--    Amara   → Web Dev, Python Bootcamp
-- =============================================================================
INSERT INTO enrollments (id, student_id, course_id) VALUES
  -- Sarah Johnson
  (1,  2, 1),   -- Web Dev
  (2,  2, 2),   -- Data Science
  (3,  2, 4),   -- Python Bootcamp

  -- Michael Chen
  (4,  3, 1),   -- Web Dev
  (5,  3, 3),   -- UI/UX Design

  -- Priya Sharma
  (6,  4, 2),   -- Data Science
  (7,  4, 3),   -- UI/UX Design
  (8,  4, 5),   -- Digital Marketing

  -- Luca Rossi
  (9,  5, 4),   -- Python Bootcamp
  (10, 5, 5),   -- Digital Marketing

  -- Amara Okafor
  (11, 6, 1),   -- Web Dev
  (12, 6, 4);   -- Python Bootcamp

-- =============================================================================
-- 6. assignments
-- =============================================================================
INSERT INTO assignments (id, course_id, title, description, deadline, max_marks) VALUES
  -- Web Dev assignments
  (1, 1, 'Build a Responsive Portfolio Website',
      'Using only HTML5 and CSS3 (no frameworks), build a fully responsive personal portfolio with a header, about section, projects grid, and a contact form. Deploy it to GitHub Pages. Submit the GitHub repository URL and the live site URL.',
      '2026-07-15 23:59:00', 100),

  (2, 1, 'REST API with Node.js & Express',
      'Build a fully functional REST API for a bookstore application. Required endpoints: CRUD for books, user registration and login with JWT, and a favourites feature. Include a Postman collection and deploy to Railway or Render.',
      '2026-08-01 23:59:00', 100),

  -- Data Science assignments
  (3, 2, 'Exploratory Data Analysis Report',
      'Choose any public dataset from Kaggle (minimum 10,000 rows). Perform a thorough EDA using Pandas and Seaborn. Submit a Jupyter Notebook (.ipynb) that documents your data cleaning process, five key insights, and three actionable business recommendations.',
      '2026-07-20 23:59:00', 100),

  (4, 2, 'Predictive Model for House Price Estimation',
      'Using the Ames Housing dataset, build a regression model that achieves an RMSE below $25,000 on the test set. Document your feature engineering choices, model selection rationale, and final evaluation metrics in a clear notebook report.',
      '2026-08-10 23:59:00', 100),

  -- UI/UX Design assignment
  (5, 3, 'Mobile App Prototype — HealthTrack',
      'Design a complete hi-fidelity prototype for a fitness-tracking mobile app called HealthTrack. Deliverables: user persona document, user flow diagram, lo-fi wireframes (all screens), hi-fi Figma prototype, and a brief usability test summary (at least 3 participants).',
      '2026-07-25 23:59:00', 100),

  -- Python Bootcamp assignments
  (6, 4, 'CLI Task Manager Application',
      'Build a command-line task manager using Python. Features required: add / list / complete / delete tasks, persist data to a JSON file, filter tasks by status, and a menu-driven interface. Include at least 10 pytest test cases with 80%+ coverage.',
      '2026-07-18 23:59:00', 100),

  (7, 4, 'Object-Oriented Library Management System',
      'Implement a Library Management System using OOP principles. Classes required: Library, Book, Member, Loan. Support borrowing and returning books, overdue detection (with fine calculation), and a search feature. Write comprehensive tests.',
      '2026-08-05 23:59:00', 100),

  -- Digital Marketing assignment
  (8, 5, 'Digital Marketing Audit & Strategy Document',
      'Select any real or hypothetical e-commerce brand and produce a 1,500-word digital marketing audit covering: SEO health check (using free tools), current social media presence, paid advertising opportunities, and a 90-day action plan with KPIs.',
      '2026-07-30 23:59:00', 100);

-- =============================================================================
-- 7. submissions
-- =============================================================================
INSERT INTO submissions (id, assignment_id, student_id, file_url, status) VALUES
  -- Sarah Johnson (student_id=2) — enrolled in Web Dev, Data Science, Python Bootcamp
  (1, 1, 2, 'https://storage.mini-lms.dev/submissions/sarah-johnson/portfolio-website.zip',       'Reviewed'),
  (3, 3, 2, 'https://storage.mini-lms.dev/submissions/sarah-johnson/eda-report.ipynb',            'Submitted'),
  (5, 6, 2, 'https://storage.mini-lms.dev/submissions/sarah-johnson/cli-task-manager.zip',        'Submitted'),

  -- Michael Chen (student_id=3) — enrolled in Web Dev, UI/UX Design
  (2, 1, 3, 'https://storage.mini-lms.dev/submissions/michael-chen/portfolio-website.zip',        'Reviewed'),
  (6, 5, 3, 'https://storage.mini-lms.dev/submissions/michael-chen/healthtrack-prototype.fig',    'Submitted'),

  -- Priya Sharma (student_id=4) — enrolled in Data Science, UI/UX Design, Digital Marketing
  (4, 3, 4, 'https://storage.mini-lms.dev/submissions/priya-sharma/eda-kaggle-dataset.ipynb',     'Reviewed'),
  (7, 5, 4, 'https://storage.mini-lms.dev/submissions/priya-sharma/healthtrack-prototype.fig',    'Reviewed'),
  (8, 8, 4, 'https://storage.mini-lms.dev/submissions/priya-sharma/marketing-audit.pdf',          'Submitted'),

  -- Luca Rossi (student_id=5) — enrolled in Python Bootcamp, Digital Marketing
  (9,  6, 5, 'https://storage.mini-lms.dev/submissions/luca-rossi/cli-task-manager.zip',         'Rejected'),
  (10, 8, 5, 'https://storage.mini-lms.dev/submissions/luca-rossi/marketing-strategy.pdf',       'Submitted'),

  -- Amara Okafor (student_id=6) — enrolled in Web Dev, Python Bootcamp
  (11, 1, 6, 'https://storage.mini-lms.dev/submissions/amara-okafor/portfolio-website.zip',      'Submitted'),
  (12, 6, 6, 'https://storage.mini-lms.dev/submissions/amara-okafor/cli-task-manager.zip',       'Submitted');

-- =============================================================================
-- 8. progress
-- =============================================================================
INSERT INTO progress (id, student_id, course_id, percentage) VALUES
  -- Sarah Johnson
  (1,  2, 1, 75.00),   -- Web Dev — 3 of 4 lessons done
  (2,  2, 2, 50.00),   -- Data Science — halfway through
  (3,  2, 4, 25.00),   -- Python Bootcamp — just started

  -- Michael Chen
  (4,  3, 1, 100.00),  -- Web Dev — fully completed
  (5,  3, 3, 33.33),   -- UI/UX — 1 of 3 lessons done

  -- Priya Sharma
  (6,  4, 2, 75.00),   -- Data Science — 3 of 4 lessons done
  (7,  4, 3, 66.67),   -- UI/UX — 2 of 3 lessons done
  (8,  4, 5, 33.33),   -- Digital Marketing — 1 of 3 lessons done

  -- Luca Rossi
  (9,  5, 4, 50.00),   -- Python Bootcamp — halfway
  (10, 5, 5, 66.67),   -- Digital Marketing — 2 of 3 lessons done

  -- Amara Okafor
  (11, 6, 1, 50.00),   -- Web Dev — halfway
  (12, 6, 4, 75.00);   -- Python Bootcamp — 3 of 4 lessons done

-- =============================================================================
-- End of seed.sql
-- =============================================================================
