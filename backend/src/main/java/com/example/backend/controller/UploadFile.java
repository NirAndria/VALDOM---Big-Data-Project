package com.example.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/upload_file")
public class UploadFile {

    @PostMapping
    public String uploadFile(@RequestParam("file") MultipartFile file , @RequestParam("master_ip") String MasterIp ) throws IOException {
        String currentDir = System.getProperty("user.dir");
        String uploadDir =  currentDir + File.separator + "uploads";
        File uploadFolder = new File(uploadDir);

        if (!uploadFolder.exists()) {
            uploadFolder.mkdir();
        }

        File serverFile = new File(uploadFolder, file.getOriginalFilename());
        System.out.println("File's name is: " + file.getOriginalFilename());
        System.out.println("File will be saved at: " + serverFile.getAbsolutePath());
        file.transferTo(serverFile);
        System.out.println("Transfer worked");  

        String currentDirectory = System.getProperty("user.dir").replace("\\", "/");


        System.out.println("Current Directory: " + currentDirectory);

        String privateKeyPath = currentDirectory + "/key_pair/key_pair_master.pem" ; // Update this th
        String remoteUser = "ubuntu";
        String remoteHost = MasterIp;
        String remotePath = "nfs_shared";

         String remoteDir = remotePath + "/nfs_shared";
        String createDirCommand = "ssh -i " + privateKeyPath + " " + remoteUser + "@" + remoteHost +
                                  " mkdir -p " + "/home/ubuntu/" + remotePath; // Check and create remote directory
        System.out.println("command is: " + String.join(" ",createDirCommand));
        try {
            // Execute the command to create the directory if it doesn't exist
            ProcessBuilder processBuilder = new ProcessBuilder(createDirCommand.split(" "));
            processBuilder.inheritIO();  // Show output in console (for debugging)
            Process process = processBuilder.start();
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                return "Error creating remote directory: Exit code " + exitCode;
            }

        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            return "Error creating remote directory: " + e.getMessage();
        }

        String[] command = {
            "scp",
            "-i",
            privateKeyPath,
            "-o", "StrictHostKeyChecking=no",
            "\"" + serverFile.getAbsolutePath() + "\"", // Enclose the local file path in quotes
            remoteUser + "@" + remoteHost + ":" + remotePath + "/"   // Enclose the remote path in quotes
        };

        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.inheritIO();  // This ensures the output and error are displayed in the console
    
        try {
            Process process = processBuilder.start();
            int exitCode = process.waitFor();  // Wait for the command to finish
            if (exitCode == 0) {
                return "File uploaded and transferred successfully!";
            } else {
                return "Error: SCP command failed with exit code " + exitCode;
            }
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            return "Error executing SCP command: " + e.getMessage();
        }
    }

    @GetMapping("/test")
    public String testEndpoint() {
        return "Server is running!";
    }
}
