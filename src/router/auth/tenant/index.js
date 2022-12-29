import express from "express";
import { tenantOnboarding } from './tenant'
import { getCommonConnection } from '../../../../db/dbConnection'



const router = express.Router();


router.post("/onboard", async (req, res, next) => {
    try {
        req.body["commonDB"] = getCommonConnection();
        let data = await tenantOnboarding(req.body);

        res.status(200).send({ type: "success", data });
    } catch (err) {
        console.log(err);
        next({
            code: 403,
            message: err,
        });
    }
});

module.exports = router;