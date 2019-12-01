$(document).ready(function () {

    // ajax for deleting employee
    $('.delete-employee').on('click', (e) => {
        $target = $(e.target);
        const id = $target.attr('data-id');

        if (confirm('Are you sure to delete this record?')) {
            $.ajax({
                type: 'DELETE',
                url: '/employee/' + id,
                success: function (response) {
                    window.location.href = '/employee/list';
                },
                error: function (err) {
                    console.log(err);
                }
            });
        }

    });
});
