document.addEventListener("DOMContentLoaded", function () {
    const messagesScript = document.getElementById("django-messages");
    if (messagesScript) {
        const messages = JSON.parse(messagesScript.textContent);
        messages.forEach(({ message, tags }) => {
            console.log("TAGS --> ", tags)
            $.notify(
                { message: message },
                {
                    type: tags || "info", // Estilo basado en tags de Django
                    placement: {
                        from: "top",
                        align: "center",
                    },
                    delay: 3000, // Tiempo visible (3 segundos)
                    animate: {
                        enter: "animated fadeInDown",
                        exit: "animated fadeOutUp",
                    },
                    template: `
                        <div data-notify="container" class="col-11 col-md-4 alert ${tags} alert-{0}" role="alert">
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <i class="material-icons">close</i>
                            </button>
                            <span data-notify="message"><b>${tags} -</b> {2}</span>
                        </div>
                    `,
                }
            );
        });
    }
});
