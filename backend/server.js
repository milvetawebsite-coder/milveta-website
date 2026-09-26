const express = require("express");
const helmet = require("helmet");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();

const PORT = 3000;


/* =====================================================
   CORS
   Allows VS Code Live Server to communicate
   with the Express backend.
===================================================== */

app.use(
    cors({
        origin: [
            "http://127.0.0.1:5500",
            "http://localhost:5500"
        ],
        credentials: true
    })
);


/* =====================================================
   SECURITY
===================================================== */

app.use(helmet());


/* =====================================================
   REQUEST DATA
===================================================== */

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =====================================================
   ADMIN SESSION
===================================================== */

app.use(
    session({
        name: "milvetaAdminSession",

        secret: "MILVETA_LOCAL_SECRET_CHANGE_LATER",

        resave: false,

        saveUninitialized: false,

        cookie: {
            httpOnly: true,

            sameSite: "lax",

            secure: false,

            maxAge: 60 * 60 * 1000
        }
    })
);


/* =====================================================
   SERVER TEST
===================================================== */

app.get("/", (req, res) => {

    res.send("MILVETA backend is running!");

});


/* =====================================================
   ADMIN 1 + ADMIN 2
===================================================== */

const adminAccounts = [

    {
        username: "admin1",

        passwordHash: bcrypt.hashSync(
            "MilvetaAdmin1!2026",
            12
        ),

        name: "Admin 1"
    },

    {
        username: "admin2",

        passwordHash: bcrypt.hashSync(
            "MilvetaAdmin2!2026",
            12
        ),

        name: "Admin 2"
    }

];


/* =====================================================
   ADMIN LOGIN
===================================================== */

app.post("/admin/login", async (req, res) => {

    try {

        const { username, password } = req.body;


        /* ---------------------------------------------
           Validate input
        --------------------------------------------- */

        if (
            typeof username !== "string" ||
            typeof password !== "string"
        ) {

            return res.status(400).json({

                success: false,

                message: "Invalid login information."

            });

        }


        /* ---------------------------------------------
           Find account
        --------------------------------------------- */

        const admin = adminAccounts.find(
            account =>
                account.username === username
        );


        if (!admin) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid username or password."

            });

        }


        /* ---------------------------------------------
           Check password
        --------------------------------------------- */

        const passwordMatches =
            await bcrypt.compare(
                password,
                admin.passwordHash
            );


        if (!passwordMatches) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid username or password."

            });

        }


        /* ---------------------------------------------
           Create fresh session
        --------------------------------------------- */

        req.session.regenerate((err) => {

            if (err) {

                console.error(
                    "SESSION ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Unable to create login session."

                });

            }


            req.session.adminAuthenticated = true;

            req.session.adminUsername =
                admin.username;

            req.session.adminName =
                admin.name;


            /* -----------------------------------------
               Save session
            ----------------------------------------- */

            req.session.save((saveError) => {

                if (saveError) {

                    console.error(
                        "SESSION SAVE ERROR:",
                        saveError
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to save login session."

                    });

                }


                res.json({

                    success: true,

                    message:
                        "Admin login successful.",

                    admin: {

                        username:
                            admin.username,

                        name:
                            admin.name

                    }

                });

            });

        });

    }

    catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Internal server error."

        });

    }

});


/* =====================================================
   CHECK LOGIN SESSION
===================================================== */

app.get("/admin/check", (req, res) => {

    if (
        !req.session.adminAuthenticated
    ) {

        return res.status(401).json({

            authenticated: false,

            message:
                "Admin authentication required."

        });

    }


    res.json({

        authenticated: true,

        username:
            req.session.adminUsername,

        name:
            req.session.adminName

    });

});


/* =====================================================
   LOGOUT
===================================================== */

app.post("/admin/logout", (req, res) => {

    req.session.destroy((error) => {

        if (error) {

            console.error(
                "LOGOUT ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Logout failed."

            });

        }


        res.clearCookie(
            "milvetaAdminSession"
        );


        res.json({

            success: true,

            message:
                "Logged out successfully."

        });

    });

});


/* =====================================================
   START SERVER
===================================================== */

app.listen(PORT, () => {

    console.log(
        "======================================"
    );

    console.log(
        "       MILVETA ADMIN BACKEND"
    );

    console.log(
        "======================================"
    );

    console.log(
        `Server: http://localhost:${PORT}`
    );

    console.log(
        "Status: RUNNING"
    );

    console.log(
        "======================================"
    );

});