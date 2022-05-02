using Microsoft.AspNetCore.SignalR;

namespace sgua.Hubs
{
    public class ChatHub : Hub
    {
        public static Task<RedisConnection> _redisConnectionFactory;
        private RedisConnection _redisConnection;

        public async Task SendMessage(string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", message);
        }

        public override async Task OnConnectedAsync()
        {
            _redisConnection = await ChatHub._redisConnectionFactory;
            await _redisConnection.BasicRetryAsync(async (db) => await db.SetAddAsync("online", Context.ConnectionId));
            await UpdateOnline();
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _redisConnection = await ChatHub._redisConnectionFactory;
            await _redisConnection.BasicRetryAsync(async (db) => await db.SetRemoveAsync("online", Context.ConnectionId));
            await UpdateOnline();
            await base.OnDisconnectedAsync(exception);
        }

        private async Task UpdateOnline()
        {
            var online = await _redisConnection.BasicRetryAsync(async (db) => await db.SetMembersAsync("online"));
            await Clients.All.SendAsync(
                "UpdateOnline",
                online?.Length,
                DateTime.Now.Ticks
            );
        }

        //public ChatHub()
        //{
        //    _redisConnectionFactory = RedisConnection.InitializeAsync();
        //}
    }
}
