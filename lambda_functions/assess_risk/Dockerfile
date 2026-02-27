FROM public.ecr.aws/lambda/python:3.12

# Copy requirements
COPY requirements.txt ${LAMBDA_TASK_ROOT}/

# Install dependencies
RUN pip install -r requirements.txt

# Copy the shared directory (since Image Lambdas cannot use Lambda Layers)
COPY shared/ ${LAMBDA_TASK_ROOT}/shared/

# Copy the function code and machine learning model
COPY handler.py ${LAMBDA_TASK_ROOT}/
COPY maatrisahyak.pkl ${LAMBDA_TASK_ROOT}/

# Set the CMD to the Mangum wrapper
CMD ["handler.lambda_handler"]
