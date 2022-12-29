import { createNamespace } from "continuation-local-storage";
import { getConnectionByID, getConnection, getCommonConnection } from "../../db/dbConnection"
import { checkmigrationStatus,tenantDBMigration } from '../../db/migrations'

// create a namespace for the application.(local storage)
let nameSpace = createNamespace(process.env.APP_NAME);

// create the instance for given tenant's
export const getInstance = async (req, res, next) => {
    try {
        const tenant_id = req.body.tenant_id
        if (!tenant_id) {
            res.json({ message: `Please provide tenant's id.` });
            return;
        }
        let connection = await getConnectionByID(tenant_id)

        await nameSpace.run(() => {
            if (connection) {
                nameSpace.set("tenantDB", connection);
                req.body["tenantDB"] = connection
                req.body["commonDB"] = getCommonConnection()
                return next()
            }
            else {
                return res
                    .status(401)
                    .send({ type: "warning", message: "Tenant data does NOT exists" });
            }
        })
    }
    catch (err) {
        console.log(err);
    }
}

// get tenantDB from namespace
export const connectionMiddleware = async (req, res, next) => {
    try {
        req.body["tenantDB"] = getConnection()
        req.body["commonDB"] = getCommonConnection()
        req.body["commonDB1"] = "Slssll"
        return next()
    }
    catch (err) {
        console.log("skskks")
    }
}

// check token access
export const isAuthenticated = async (req, res, next) => {
    try {
        if (
            req.headers.authorization &&
            req.headers.authorization.split(" ")[1] &&
            req.headers.authorization.split(" ")[1] != "null" &&
            req.headers.authorization.split(" ")[1] != "undefined"
        ) {
            const token = req.headers.authorization.split(" ")[1];
            const payload = await verify(token);
            const token_detial = decode(token);
            const details = await Modle.profile.findOne({
                where: { user_profile_id: token_detial?.id },
                attributes: ["id"],
            });
            res.locals.user = payload;
            req.body["profile_id"] = details?.id;
            req.body["user_profile_id"] = token_detial?.id;
            return next();
        }
        req.body["profile_id"] = "details?.id";
        return next();
        //   return next({
        //     code: 403,
        //     message: "You are not an authorized user!",
        //   });
    } catch (err) {
        console.log(err);
        return next({
            code: 400,
            message: err.message,
        });
    }
};

export const migartionMiddleware = async (req, res, next) => {
    try {
        let migration_status = await checkmigrationStatus(req.body);
        if (!migration_status) {
            await tenantDBMigration(req.body);
        }
        next()
    }
    catch (err) {
        console.log(err)
        res.status(400).send("Please Check MigrationFile")
        return;
    }
}
