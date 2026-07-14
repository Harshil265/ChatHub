const jwt = require("jsonwebtoken");

module.exports = (req,res,next)=>{

    const authHeader=req.header("Authorization");

    if(!authHeader){

        return res.status(401).json({

            success:false,

            message:"Access Denied"

        });

    }

    const token=authHeader.replace("Bearer ","");

    try{

        const decoded=jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        console.log("Decoded Token:", decoded);

        req.user=decoded;

        next();

    }

    catch(err){

        res.status(401).json({

            success:false,

            message:"Invalid Token"

        });

    }

}