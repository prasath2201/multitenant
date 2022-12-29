import express from "express";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { tenantDB } = req.body

    let property_hierarchy = await
      tenantDB.select([
        "d.name"
      ])
        .from("property as d")
    res.status(200).send({ type: "success", data: property_hierarchy });
  } catch (err) {
    console.log(err);
    next({
      code: 500,
      message: err,
    });
  }
});


module.exports = router;
