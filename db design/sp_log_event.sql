DELIMITER $$

CREATE PROCEDURE `sp_log_event`(
    IN p_user_id INT,
    IN p_role_id INT,
    IN p_action VARCHAR(50),
    IN p_description VARCHAR(255),
    IN p_ip_address VARCHAR(45)
)
BEGIN
    INSERT INTO sneakerhead.user_logs (
        user_id,
        role_id,
        action,
        description,
        ip_address,
        created_at
    )
    VALUES (
        p_user_id,
        p_role_id,
        p_action,
        p_description,
        p_ip_address,
        NOW()
    );
END $$

DELIMITER ;
