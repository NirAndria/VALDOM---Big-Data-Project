from flask import Flask, request, jsonify
from flask_cors import CORS
import boto3
from botocore.exceptions import ClientError
import random, string, os
import time


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

#Explicitly specify the AWS credentials (you can replace these with your own values)

aws_access_key_id_path = os.path.join("..", "aws_access_key.txt")
aws_secret_access_key_path = os.path.join("..", "aws_secret_access_key.txt")

with open(aws_access_key_id_path, "r", encoding="utf-8") as file:
    aws_access_key_id = file.read()

with open(aws_secret_access_key_path, "r", encoding="utf-8") as file:
    aws_secret_access_key = file.read()

# Create EC2 client using the credentials
ec2 = boto3.client('ec2', 
                   region_name='us-east-1',
                   aws_access_key_id=aws_access_key_id,
                   aws_secret_access_key=aws_secret_access_key)
                   
 
# Add a route for the root URL
@app.route('/')
def home():
    return "Welcome to the EC2 Management API"            

@app.route('/add_instance', methods=['POST'])
def add_instance():
    data = request.json
    instance_count = data.get('instance_count',1)
    instance_type = data.get('instance_type', 't2.micro')

    # Specify the Key Pair and Security Group
    key_name = data.get('key_name')
    security_group_id = data.get('security_group_id')
    #vpc_id = 'vpc-07362279aab1b1016'

    if not key_name:
        key_name = create_key_pair()
    if not security_group_id:
        security_group_id = create_security_group()

    # Use the subnet ID you created
    #subnet_id = 'subnet-082a76f32b3f1c314'

    # If subnet_id is not found, return an error
    #if not subnet_id:
        #return jsonify({"error": f"No valid subnet found in VPC {vpc_id}"}), 400  # Change 500 to 400 for bad request

    instance_ids = []
    try:
        for i in range(instance_count):
            response = ec2.run_instances(
                ImageId='ami-0e2c8caa4b6378d8c',
                MinCount=1,
                MaxCount=1,
                InstanceType=instance_type,
                KeyName=key_name,
                SecurityGroupIds=[security_group_id]
                #SubnetId=subnet_id
                )
            instance_ids.append(response['Instances'][0]['InstanceId'])

        return jsonify({
            "message": f"{instance_count} instance(s) created successfully",
            "instance_ids": instance_ids,
            "key_name": key_name,
            "security_group_id": security_group_id
        }), 200
    except ClientError as e:
        return jsonify({"error": str(e)}), 500


def create_key_pair():
    """Create a new key pair if one doesn't exist, and return the key name."""
    try:
        key_name = 'key_pair_master' #+ str(os.urandom(1).hex())  # Generate a random key name for uniqueness
        response = ec2.create_key_pair(KeyName=key_name)  # Create the key pair
        key_material = response['KeyMaterial']

        # Save the private key to a .pem file
        with open("./backend/key_pair/" + f'{key_name}.pem', 'w') as key_file:
            key_file.write(key_material)
        
        print(f"Key pair created successfully, saved as '{key_name}.pem'")
        return key_name
    except ClientError as e:
        print(f"Error creating key pair: {e}")
        return None  

def create_security_group():
    """Create a new security group if it doesn't exist, and return the group ID."""
    try:
        group_name = 'sg_' + str(os.urandom(8).hex())  # Generate a random group name for uniqueness
        response = ec2.create_security_group(
            GroupName=group_name,
            Description='Security group created via boto3 for API'
            #VpcId='vpc-015a26c2d4afae0dd'
        )
        security_group_id = response['GroupId']
        
        # Allow inbound SSH (port 22)
        ec2.authorize_security_group_ingress(
            GroupId=security_group_id,
            IpProtocol='-1',  # '-1' means all protocols
            FromPort=-1,      # Allows all ports
            ToPort=-1,        # Allows all ports
            CidrIp='0.0.0.0/0'  # Allow SSH from any IP (you can adjust this to your needs)
        )

        print(f"Security group created successfully, ID: {security_group_id}")
        return security_group_id
    
    except ClientError as e:
        print(f"Error creating security group: {e}")
        return None    

@app.route('/create_Master', methods=['POST'])
def create_Master():
    data = request.json
    instance_count = data.get('instance_count',1)
    instance_type = data.get('instance_type', 't2.micro')
    key_name = data.get('key_name')
    security_group_id = data.get('security_group_id')
    if not key_name:
        key_name = create_key_pair()
    if not security_group_id:
        security_group_id = create_security_group()
    try:
        response = ec2.run_instances(
            ImageId='ami-0e2c8caa4b6378d8c', 
            MinCount=1,
            MaxCount=1,
            InstanceType='t2.micro',
            KeyName= key_name,
            SecurityGroupIds=[security_group_id],
            UserData='''#!/bin/bash
            #!/bin/bash
	    # Installer NFS Server 
	    sudo apt-get update -y
	    sudo apt-get install -y nfs-kernel-server openjdk-8-jdk
	    # Create the shared directory
	    sudo mkdir -p /mnt/nfs_shared
	    sudo chmod 777 /mnt/nfs_shared  # Permissions de lecture, écriture et exécution
	    # Configure NFS exports to share the directory
	    echo "/mnt/nfs_shared *(rw,sync,no_subtree_check)" | sudo tee -a /etc/exports
	    # Enable and start the NFS server
	    sudo systemctl enable nfs-kernel-server   # Activer l'NFS
	    sudo systemctl start nfs-kernel-server    # Démarrer l'NFS
	    # Refresh NFS exports
	    sudo exportfs -arv    # Actualiser les partages NFS configurés dans /etc/exports
	    # Ensure NFS server is up before proceeding
	    sudo systemctl status nfs-kernel-server
	    # Download Hadoop to the shared directory
	    wget https://archive.apache.org/dist/hadoop/common/hadoop-2.7.1/hadoop-2.7.1.tar.gz -P /mnt/nfs_shared
            '''
            )
        instance_id = response['Instances'][0]['InstanceId']
        ec2.create_tags(
            Resources=[instance_id],
            Tags=[{'Key': 'Name', 'Value': 'Master'}]
        )
        return jsonify({
            "message": "Master instance created successfully",
            "instance_id": instance_id,
            "key_name": key_name,
            "security_group_id": security_group_id
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
               
@app.route('/create_worker_instances', methods=['POST'])
def create_worker_instances():
    data = request.json
    instance_count = data.get('instance_count', 1)
    matser_instance_id = data.get('master_instance_id')
    
    if not matser_instance_id:
        return jsonify({"error": "Master Instance ID is required"}), 400 
    try:
        instance_details = ec2.describe_instances(
            InstanceIds=[matser_instance_id]
        )
        master_instance = instance_details['Reservations'][0]['Instances'][0]
        master_public_ip = master_instance.get('PublicIpAddress')
        key_name = master_instance.get('KeyName')
        security_groups = master_instance.get('SecurityGroups', [])
        security_group_id = security_groups[0]['GroupId']
        
        response = ec2.run_instances(
            ImageId='ami-0e2c8caa4b6378d8c',  # Remplace par l'AMI Ubuntu
            MinCount=instance_count,
            MaxCount=instance_count,
            InstanceType='t2.micro',
            KeyName=key_name,
            SecurityGroupIds=[security_group_id],  # Security Group avec le port 2049 ouvert
            UserData=f'''#!/bin/bash
            sudo apt-get update -y
            sudo apt-get install -y nfs-common openjdk-8-jdk
            sudo mkdir -p /mnt/nfs_shared                
            sudo systemctl daemon-reload              
            sudo mount -t nfs {master_public_ip}:/mnt/nfs_shared /mnt/nfs_shared
            echo "{master_public_ip}:/mnt/nfs_shared /mnt/nfs_shared nfs defaults 0 0" | sudo tee -a /etc/fstab
            # Extract Hadoop from the shared NFS directory
            sudo chmod 755 /usr/local
            sudo tar zxvf /mnt/nfs_shared/hadoop-2.7.1.tar.gz -C /usr/local
            ls -lh /usr/local
            # Hadoop Environment Variables
            cat <<EOF | sudo tee -a ~/.bashrc
            export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
            export HADOOP_HOME=/usr/local/hadoop
            export PATH=\\$PATH:\\$JAVA_HOME/bin:\\$HADOOP_HOME/bin:\\$HADOOP_HOME/sbin
            EOF
            source /home/ubuntu/.bashrc
            '''
        )
        instance_ids = [i['InstanceId'] for i in response['Instances']]
        return jsonify({
            "message": "Worker instances created and connected to NFS successfully",
            "instance_ids": instance_ids
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    # working command: curl -X POST http://localhost:5000/create_worker_instances -H "Content-Type: application/json" -d "{\"instance_count\": 1, \"master_instance_id\": \"i-00872456048581b48\"}"

        
@app.route('/delete_all', methods=['POST'])
def delete_all():
    try:
        
        instances = ec2.describe_instances()
        instance_ids = []
        for reservation in instances['Reservations']:
            for instance in reservation['Instances']:
                instance_ids.append(instance['InstanceId'])

        if instance_ids:
            ec2.terminate_instances(InstanceIds=instance_ids)
            print(f"Terminated instances: {instance_ids}")

   
        key_pairs = ec2.describe_key_pairs()
        for key_pair in key_pairs['KeyPairs']:
            key_name = key_pair['KeyName']
            ec2.delete_key_pair(KeyName=key_name)
            print(f"Deleted key pair: {key_name}")
              
        time.sleep(60)
        security_groups = ec2.describe_security_groups()
        for sg in security_groups['SecurityGroups']:
            if sg['GroupName'] != 'default':
                ec2.delete_security_group(GroupId=sg['GroupId'])
                print(f"Deleted security group: {sg['GroupId']}")

        return jsonify({"message": "All instances, key pairs, and security groups (except default) deleted successfully"}), 200
    except ClientError as e:
        return jsonify({"error": str(e)}), 500     


@app.route('/get_info', methods=['POST'])
def get_info():
    data = request.json
    instance_count = data.get('instance_count',1)
    instance_type = data.get('instance_type', 't2.micro')
    key_name = data.get('key_name')
    security_group_id = data.get('security_group_id')
    try:

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
        print(instances)
        return jsonify(instances), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500   
    
@app.route('/delete_instance', methods=['POST'])
def delete_instance():
    try:
        instance_id = request.json.get('instance_id')

        if not instance_id:
            return jsonify({"error": "Instance ID is required"}), 400
        response = ec2.terminate_instances(InstanceIds=[instance_id])
        terminated_instance_ids = [instance['InstanceId'] for instance in response['TerminatingInstances']]
        if terminated_instance_ids:
            print(f"Terminated instance: {terminated_instance_ids}")
            return jsonify({"message": f"Instance {instance_id} terminated successfully"}), 200
        else:
            return jsonify({"error": "Failed to terminate instance"}), 500
    except ClientError as e:
        return jsonify({"error": str(e)}), 500

        
        
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

