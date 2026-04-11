# Dockerfile for BesaChain L1 Contract Deployment
# Uses op-deployer with pre-built artifacts

FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    jq \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /deploy

# Copy deployment files
COPY setup-op-deployer.sh .
COPY deploy.sh .
COPY generate-rollup-config.sh .
COPY intent.example.toml .

# Download op-deployer
RUN chmod +x setup-op-deployer.sh && ./setup-op-deployer.sh

# Create directories
RUN mkdir -p .deployer config

# Set environment
ENV PATH="/deploy/bin:${PATH}"

# Default command
CMD ["./deploy.sh"]
