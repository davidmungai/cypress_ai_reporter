# Cypress AI Reporter (Elasticsearch Backend)

## Setup

1.  **Start Infrastructure**:
    ```bash
    docker-compose up -d
    ```
    This starts Elasticsearch (port 9200), Kibana (5601).

2.  **Start Ollama**:
    Ensure you have [Ollama](https://ollama.ai/) installed and running on `localhost:11434`.
    Pull the models:
    ```bash
    ollama pull nomic-embed-text
    ollama pull llava
    ```

3.  **Install Python Dependencies**:
    The plugin uses Python for video processing. Ensure Python 3 is installed:
    ```bash
    pip3 install opencv-python numpy
    ```
    *(Ensure `ffmpeg` is also installed on your system)*

4.  **Install Dependencies**:
    ```bash
    npm install
    ```

5.  **Initialize Index**:
    ```bash
    npm start
    ```

## Usage

1.  **Run Cypress Tests**:
    Go to `../example` and run your tests.
    ```bash
    cd ../example
    npx cypress run
    ```
    The tests will automatically send logs and error embeddings to Elasticsearch.

2.  **Query Failures**:
    Back in this directory:
    ```bash
    npm run query "Why did the login test fail?"
    ```
