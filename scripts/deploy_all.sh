#!/bin/bash

################################################################################
# MaatriSahayak - Deploy All Script
#
# This script deploys all Lambda functions and infrastructure to AWS.
#
# Usage:
#   bash scripts/deploy_all.sh
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo -e "${BLUE}======================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}======================================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed"
        echo "Install from: https://aws.amazon.com/cli/"
        exit 1
    fi
    print_success "AWS CLI installed"
    
    # Check SAM CLI
    if ! command -v sam &> /dev/null; then
        print_error "AWS SAM CLI is not installed"
        echo "Install from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
        exit 1
    fi
    print_success "SAM CLI installed"
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed"
        exit 1
    fi
    print_success "Python 3 installed"
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured"
        echo "Run: aws configure"
        exit 1
    fi
    print_success "AWS credentials configured"
    
    echo ""
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    # Install shared layer dependencies
    print_info "Installing shared layer dependencies..."
    cd lambda_functions/shared
    if [ -f requirements.txt ]; then
        pip install -r requirements.txt -t python/ --quiet
        print_success "Shared layer dependencies installed"
    else
        print_warning "No requirements.txt found in shared layer"
    fi
    cd ../..
    
    # Install function-specific dependencies
    for func_dir in lambda_functions/*/; do
        if [ -d "$func_dir" ] && [ "$func_dir" != "lambda_functions/shared/" ]; then
            func_name=$(basename "$func_dir")
            if [ -f "${func_dir}requirements.txt" ]; then
                print_info "Installing dependencies for $func_name..."
                cd "$func_dir"
                pip install -r requirements.txt -t . --quiet
                cd ../..
            fi
        fi
    done
    
    print_success "All dependencies installed"
    echo ""
}

# Build SAM application
build_sam() {
    print_header "Building SAM Application"
    
    if [ ! -f infrastructure/template.yaml ]; then
        print_error "SAM template not found at infrastructure/template.yaml"
        exit 1
    fi
    
    print_info "Building SAM application..."
    sam build --template infrastructure/template.yaml
    
    print_success "SAM application built successfully"
    echo ""
}

# Deploy to AWS
deploy_sam() {
    print_header "Deploying to AWS"
    
    print_info "Deploying SAM application..."
    print_warning "This may take several minutes..."
    
    # Check if samconfig.toml exists
    if [ -f infrastructure/samconfig.toml ]; then
        print_info "Using existing SAM configuration"
        sam deploy --config-file infrastructure/samconfig.toml
    else
        print_info "Running guided deployment (first time)"
        sam deploy --guided
    fi
    
    print_success "Deployment completed successfully"
    echo ""
}

# Setup DynamoDB tables
setup_dynamodb() {
    print_header "Setting Up DynamoDB Tables"
    
    read -p "Do you want to setup DynamoDB tables? (yes/no): " response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        python3 scripts/setup_dynamodb.py
    else
        print_warning "Skipping DynamoDB setup"
    fi
    echo ""
}

# Seed data
seed_data() {
    print_header "Seeding Test Data"
    
    read -p "Do you want to seed test data? (yes/no): " response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        python3 scripts/seed_data.py
    else
        print_warning "Skipping data seeding"
    fi
    echo ""
}

# Get API endpoint
get_api_endpoint() {
    print_header "Deployment Information"
    
    print_info "Fetching API Gateway endpoint..."
    
    # Get stack outputs
    STACK_NAME="maatrisahayak"
    API_ENDPOINT=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
        --output text 2>/dev/null || echo "Not found")
    
    if [ "$API_ENDPOINT" != "Not found" ]; then
        print_success "API Endpoint: $API_ENDPOINT"
        echo ""
        echo "📋 Save this endpoint for your frontend configuration:"
        echo "   VITE_API_BASE_URL=$API_ENDPOINT"
    else
        print_warning "Could not retrieve API endpoint"
        print_info "Check AWS CloudFormation console for stack outputs"
    fi
    
    echo ""
}

# Main deployment flow
main() {
    print_header "🚀 MaatriSahayak - Deploy All"
    echo ""
    
    # Confirm deployment
    print_warning "This will deploy the entire MaatriSahayak platform to AWS"
    read -p "Continue? (yes/no): " response
    if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_error "Deployment cancelled"
        exit 0
    fi
    echo ""
    
    # Run deployment steps
    check_prerequisites
    install_dependencies
    build_sam
    deploy_sam
    setup_dynamodb
    seed_data
    get_api_endpoint
    
    # Success message
    print_header "🎉 Deployment Completed Successfully!"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Update frontend/.env with API endpoint"
    echo "   2. Test API endpoints using Postman or curl"
    echo "   3. Deploy frontend to S3 + CloudFront"
    echo "   4. Monitor CloudWatch logs for any issues"
    echo ""
    print_header "======================================================================="
}

# Run main function
main
