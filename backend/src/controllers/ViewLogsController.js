import Log from "../models/UserLogs.js";

export const getLogs = async (req, res) => {
    try {
        const knex = Log.knex();
        const logs = await knex('user_logs')
                .select(
                    'user_logs.log_id',
                    'user_logs.user_id',
                    'user_logs.role_id',
                    'user_logs.action',
                    'user_logs.description',
                    'user_logs.ip_address',
                    'user_logs.created_at',
                    'users.fname',
                    'users.mname',
                    'users.lname',
                    'users.email',
                    'ref_roles.role_name'
                )
                .leftJoin('users', 'user_logs.user_id', 'users.user_id')
                .leftJoin('ref_roles', 'user_logs.role_id', 'ref_roles.role_id')
                .orderBy('user_logs.created_at', 'desc');

        const formattedLogs = logs.map(log => ({
            log_id: log.log_id,
            user_id: log.user_id,
            role_id: log.role_id,
            action: log.action,
            description: log.description,
            ip_address: log.ip_address,
            created_at: new Date(log.created_at).toISOString(),
            user_name: log.fname && log.lname ? 
                `${log.fname}${log.mname ? ' ' + log.mname : ''} ${log.lname}`.trim() : 'System',
            email: log.email || 'N/A',
            role_name: log.role_name || 'N/A'
        }));

        res.status(200).json({ logs: formattedLogs });
    } catch (error) {
        console.error('Error in getLogs:', error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}