import boto3, os

aws_access_key_id_path = os.path.join("..", "aws_access_key.txt")
aws_secret_access_key_path = os.path.join("..", "aws_secret_access_key.txt")

with open(aws_access_key_id_path, "r", encoding="utf-8") as file:
    aws_access_key_id = file.read()

with open(aws_secret_access_key_path, "r", encoding="utf-8") as file:
    aws_secret_access_key = file.read()

ec2 = boto3.client('ec2',
                   region_name='us-east-1',
                   aws_access_key_id=aws_access_key_id,
                   aws_secret_access_key=aws_secret_access_key)

response = ec2.describe_instances()
for reservation in response['Reservations']:
    for instance in reservation['Instances']:
        # Check if the instance is running
        if instance['State']['Name'] == 'running':
            instance_id = instance['InstanceId']
            public_ip = instance.get('PublicIpAddress', 'No public IP assigned')
            private_ip = instance.get('PrivateIpAddress', 'No private IP assigned')
            
            print(f"Instance ID: {instance_id}")
            print(f"Public IP: {public_ip}")
            print(f"Private IP: {private_ip}")
            print("-------------------------------")

# List to store instance information
instances = []
for reservation in response['Reservations']:
    for instance in reservation['Instances']:
        # Check if the instance is running
        if instance['State']['Name'] == 'running':
            instance_id = instance['InstanceId']
            public_ip = instance.get('PublicIpAddress', 'No public IP assigned')
            private_ip = instance.get('PrivateIpAddress', 'No private IP assigned')
            launch_time = instance['LaunchTime']  # Capture launch time to sort
            
            instances.append({
                "instance_id": instance_id,
                "public_ip": public_ip,
                "private_ip": private_ip,
                "launch_time": launch_time
            })