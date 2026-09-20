# Database Schema

## Tables

### users

- id, name, email, password, role (user/admin), email_verified_at, avatar, timestamps

### user_preferences

- id, user_id (FK), education_level, interests (JSON), favorite_visual_styles (JSON), favorite_topics (JSON), study_preferences (JSON), timestamps

### subjects

- id, user_id (FK), name, code, teacher, description, color, timestamps

### tasks

- id, user_id (FK), subject_id (FK nullable), title, description, priority (low/medium/high), status (pending/in_progress/completed), due_date, due_time, completed_at, timestamps

### schedules

- id, user_id (FK), subject_id (FK nullable), title, day (0-6), start_time, end_time, type (study/class), location, timestamps

### study_sessions

- id, user_id (FK), subject_id (FK nullable), start_time, end_time, duration_seconds, completed (bool), timestamps

### grades

- id, user_id (FK), subject_id (FK), title, type (exam/quiz/assignment/project/other), score, max_score, date, timestamps

### learning_results

- id, user_id (FK), subject_id (FK nullable), grade_id (FK nullable), title, description, file_path, file_type, visibility (private/public), timestamps

### gallery_items

- id, user_id (FK), title, description, file_path, type (personal/inspiration/public), source, visibility (private/public), timestamps

### gallery_tags

- id, name, slug, timestamps

### gallery_item_tags

- gallery_item_id (FK), gallery_tag_id (FK)

### reports

- id, reporter_id (FK users), reportable_type, reportable_id, reason (spam/inappropriate/copyright/irrelevant/other), description, status (pending/reviewed/resolved/rejected), reviewed_by (FK users nullable), reviewed_at, timestamps

## Key Relationships

- users 1:N subjects, tasks, schedules, study_sessions, grades, learning_results, gallery_items
- subjects 1:N tasks, schedules, grades, learning_results
- gallery_items M:N gallery_tags (pivot: gallery_item_tags)
