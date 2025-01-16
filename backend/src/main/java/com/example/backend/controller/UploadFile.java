package com.example.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UploadFile {

    @PostMapping("/upload-file")
    public ResponseEntity<?> uploadFile(@RequestBody Map<String, String> request) {
        String localFilePath = request.get("local_file_path");

        if (localFilePath == null || localFilePath.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Missing local file path"));
        }

        String privateKeyPath = "/home/ubuntu/Infra/key_pair_5f.pem"; // Update this path
        String remoteUser = "ubuntu";
        String remoteHost = "18.212.10.118";
        String remotePath = "/home/ubuntu/.ssh";

        // SCP command
        String[] command = {
            "scp", "-i", privateKeyPath, localFilePath,
            remoteUser + "@" + remoteHost + ":" + remotePath
        };

        try {
            // Execute the command
            ProcessBuilder processBuilder = new ProcessBuilder(command);
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();

            // Capture output and error messages
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            int exitCode = process.waitFor();

            if (exitCode != 0) {
                return ResponseEntity.status(500).body(Map.of("success", false, "error", output.toString()));
            }

            return ResponseEntity.ok(Map.of("success", true, "output", output.toString()));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
