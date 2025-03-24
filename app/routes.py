from flask import Blueprint, render_template, request, flash, redirect, url_for

main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def home():
    return render_template("home.html")


@main_bp.route("/about")
def about():
    return render_template("about.html")


@main_bp.route("/research")
def research():
    return render_template("research.html")


@main_bp.route("/research/<report_id>")
def research_detail(report_id):
    return render_template("research_detail.html", report_id=report_id)


@main_bp.route("/contact")
def contact():
    return render_template("contact.html")


@main_bp.route("/contact/submit", methods=["POST"])
def contact_submit():
    name = request.form.get("name")
    email = request.form.get("email")
    message = request.form.get("message")

    # Here you would typically send an email or save to database
    # For now, we'll just flash a message
    flash("Thank you for your message! We will get back to you soon.")
    return redirect(url_for("main.home"))


@main_bp.route("/privacy")
def privacy():
    return render_template("privacy.html")


@main_bp.route("/terms")
def terms():
    return render_template("terms.html")
