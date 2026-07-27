-- Allow date_quota to be NULL until the first failed login attempt.
ALTER TABLE `user` MODIFY `date_quota` date DEFAULT NULL;
