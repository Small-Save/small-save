FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

RUN pip install --upgrade pip
RUN pip install pipenv

# Cache dependencies
COPY Pipfile Pipfile.lock /app/

# Install production dependencies only
RUN pipenv install --system --deploy

# Copy your actual project code
COPY . /app/

EXPOSE 8000

# Replace 'your_project_name' with your actual core folder name
CMD ["gunicorn", "smallSave.asgi:application", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]