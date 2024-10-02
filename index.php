<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>My First PHP Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        header {
            background-color: #333;
            color: white;
            padding: 10px 0;
            text-align: center;
        }
        h1 {
            margin: 0;
            font-size: 2em;
        }
        main {
            padding: 20px;
        }
        p {
            font-size: 1.2em;
        }
        footer {
            background-color: #333;
            color: white;
            text-align: center;
            padding: 10px 0;
            position: fixed;
            bottom: 0;
            width: 100%;
        }
    </style>
</head>
<body>

<header>
    <h1>Welcome to My PHP Page</h1>
</header>

<main>
    <p><?php echo "Hello! This is a simple PHP page."; ?></p>
    <p><?php echo "The current server time is: " . date('Y-m-d H:i:s'); ?></p>
    <p>Here is some basic server information:</p>
    <pre><?php echo phpinfo(); ?></pre>
</main>

<footer>
    <p>Created by Your Name © 2024</p>
</footer>

</body>
</html>
