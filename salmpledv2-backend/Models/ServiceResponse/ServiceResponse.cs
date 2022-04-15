namespace salmpledv2_backend.Models.ServiceResponse
{
    public class ServiceResponse<T>
    {
        public T? Result { get; set; }
        public string? Err { get; set; }
    }
}