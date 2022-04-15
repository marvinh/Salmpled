namespace salmpledv2_backend.Models.DTOS
{
    public class AddSampleDTO
    {
        public string Name { get; set; }

        public string Bucket {get; set;}

        public string Region {get; set;}

        public string CKey {get; set;}

        public string UKey {get; set;}

        public Guid PackId{get; set;}

        public string MimeType {get;set;}

    }
}