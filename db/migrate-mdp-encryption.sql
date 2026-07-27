-- Widen compte.mdp to store AES-256-GCM ciphertext (run once on existing databases).
ALTER TABLE `compte` MODIFY `mdp` VARCHAR(500) NOT NULL;
